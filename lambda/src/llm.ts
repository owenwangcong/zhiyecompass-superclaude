/**
 * LLM Integration Module
 *
 * Supports multiple LLM providers:
 * - OpenAI (GPT-4o, GPT-4-turbo)
 * - Anthropic Claude (via direct API)
 * - DeepSeek
 */

import { UserProfile, ProjectRecommendation, LLMRecommendationResponse } from './types';

/**
 * Resource type labels mapping (Chinese)
 */
const RESOURCE_TYPE_LABELS: Record<string, string> = {
  connections: '人脉资源（行业人脉、供应商、客户资源）',
  channels: '渠道资源（销售渠道、分销网络、合作平台）',
  equipment: '设备物品（生产设备、专业工具、电子设备）',
  property: '房产场地（门店、仓库、办公场地、厂房）',
  vehicles: '车辆资源（私家车、货车、配送车辆）',
  inventory: '库存货源（产品库存、货源渠道、供应链资源）',
  intellectual: '知识产权（专利、商标、版权、技术秘密）',
  other: '其他资源',
};

/**
 * Helper function to get effective value (custom value if "other" is selected, otherwise the preset value)
 */
function getEffectiveValue(presetValue: string | undefined, customValue: string | undefined): string {
  if (presetValue === 'other' && customValue) {
    return customValue;
  }
  return presetValue || '未知';
}

/**
 * Generate the recommendation prompt based on user profile
 * Handles both flat profile (from frontend) and nested location (from types)
 */
function generatePrompt(profile: UserProfile | Record<string, unknown>): string {
  // Handle both flat and nested location structures
  const province = (profile as Record<string, unknown>).province ||
                   ((profile as UserProfile).location?.province) || '';
  const city = (profile as Record<string, unknown>).city ||
               ((profile as UserProfile).location?.city) || '';
  const cityLevelRaw = (profile as Record<string, unknown>).cityLevel ||
                    ((profile as UserProfile).location?.cityLevel) || '';

  // Get custom values
  const customAgeRange = (profile as Record<string, unknown>).customAgeRange as string | undefined;
  const customCityLevel = (profile as Record<string, unknown>).customCityLevel as string | undefined;
  const customCurrentStatus = (profile as Record<string, unknown>).customCurrentStatus as string | undefined;
  const customEducation = (profile as Record<string, unknown>).customEducation as string | undefined;
  const customStartupBudget = (profile as Record<string, unknown>).customStartupBudget as string | undefined;
  const customIndustryBackground = (profile as Record<string, unknown>).customIndustryBackground as string | undefined;
  const customSkills = (profile as Record<string, unknown>).customSkills as string | undefined;
  const overallDescription = (profile as Record<string, unknown>).overallDescription as string | undefined;

  // Apply effective values (use custom if "other" is selected)
  const ageRange = getEffectiveValue(profile.ageRange as string, customAgeRange);
  const cityLevel = getEffectiveValue(cityLevelRaw as string, customCityLevel);
  const currentStatus = getEffectiveValue(profile.currentStatus as string, customCurrentStatus);
  const education = getEffectiveValue(profile.education as string, customEducation);
  const startupBudget = getEffectiveValue(profile.startupBudget as string, customStartupBudget);

  // Safely handle arrays that might be undefined
  let industryBackgroundArr = Array.isArray(profile.industryBackground)
    ? profile.industryBackground.filter(item => item !== 'other')
    : [];
  // Add custom industry background if provided
  if (customIndustryBackground) {
    industryBackgroundArr = [...industryBackgroundArr, customIndustryBackground];
  }
  const industryBackground = industryBackgroundArr.join('、') || '未知';

  let skillsArr = Array.isArray(profile.skills)
    ? profile.skills.filter(item => item !== 'other')
    : [];
  // Add custom skills if provided
  if (customSkills) {
    skillsArr = [...skillsArr, customSkills];
  }
  const skills = skillsArr.join('、') || '未知';

  // Handle other resources (from both flat and nested structures)
  let resourceTypesRaw: string[] = [];
  let resourceDescription = '';

  // Try flat structure first (from frontend: resourceTypes, resourceDescription)
  if (Array.isArray((profile as Record<string, unknown>).resourceTypes)) {
    resourceTypesRaw = (profile as Record<string, unknown>).resourceTypes as string[];
  }
  if (typeof (profile as Record<string, unknown>).resourceDescription === 'string') {
    resourceDescription = (profile as Record<string, unknown>).resourceDescription as string;
  }

  // Try nested structure (from types: otherResources.resourceTypes, otherResources.description)
  const otherResources = (profile as UserProfile).otherResources;
  if (otherResources) {
    if (Array.isArray(otherResources.resourceTypes) && otherResources.resourceTypes.length > 0) {
      resourceTypesRaw = otherResources.resourceTypes;
    }
    if (otherResources.description) {
      resourceDescription = otherResources.description;
    }
  }

  // Format resource types with Chinese labels
  const resourceTypes = resourceTypesRaw
    .map(type => RESOURCE_TYPE_LABELS[type] || type)
    .join('、');

  // Build other resources section
  let otherResourcesSection = '';
  if (resourceTypes || resourceDescription) {
    otherResourcesSection = `
- 其他可利用资源：${resourceTypes || '未指定类型'}${resourceDescription ? `\n  详细描述：${resourceDescription}` : ''}`;
  }

  // Build overall description section
  let overallDescriptionSection = '';
  if (overallDescription) {
    overallDescriptionSection = `\n- 用户补充说明：${overallDescription}`;
  }

  return `你是一个专业的副业/创业推荐顾问，专注于中国市场。

用户画像：
- 年龄段：${ageRange}
- 地域：${province} ${city}（${cityLevel}）
- 当前状态：${currentStatus}
- 学历：${education}
- 行业背景：${industryBackground}
- 技能：${skills}
- 可用时间：${profile.availableTimePerWeek || 0}小时/周
- 启动资金：${startupBudget}${otherResourcesSection}${overallDescriptionSection}

请为用户推荐1个最匹配的副业/创业项目。输出**纯JSON格式**（不要包含任何markdown代码块标记），包含以下字段：

{
  "user_summary": "用户情况概括（50-80字，用第二人称'您'，简洁总结用户的核心特点、优势和限制条件）",
  "recommendation_reason": "推荐理由（100-150字，解释为什么这个项目适合该用户，包括：与用户技能/经验的匹配点、与时间/资金条件的适配性、如何利用用户的资源优势等）",
  "title": "项目名称",
  "summary": "一句话描述（不超过30字）",
  "description": "详细项目描述（200-300字）",
  "revenue": {
    "monthly_min": 最低月收入（元，数字）,
    "monthly_max": 最高月收入（元，数字）,
    "breakeven_months": 回本周期（月，数字）
  },
  "startup_cost": {
    "min": 最低启动成本（元，数字）,
    "max": 最高启动成本（元，数字）
  },
  "work_content": ["工作内容1", "工作内容2", "工作内容3"],
  "success_factors": ["成功关键因素1", "成功关键因素2", "成功关键因素3"],
  "risk_assessment": {
    "legal": {
      "level": "低/中/高",
      "description": "法律风险描述",
      "mitigation": ["规避建议1", "规避建议2"]
    },
    "financial": {
      "level": "低/中/高",
      "description": "财务风险描述",
      "mitigation": ["规避建议1", "规避建议2"]
    },
    "platform": {
      "level": "低/中/高",
      "description": "平台风险描述（如微信、淘宝等平台规则变化）",
      "mitigation": ["规避建议1", "规避建议2"]
    },
    "competition": {
      "level": "低/中/高",
      "description": "竞争风险描述",
      "mitigation": ["规避建议1", "规避建议2"]
    }
  },
  "roadmap": [
    {
      "phase": "阶段1名称",
      "duration_days": 天数（数字）,
      "tasks": ["任务1", "任务2"]
    },
    {
      "phase": "阶段2名称",
      "duration_days": 天数（数字）,
      "tasks": ["任务1", "任务2"]
    },
    {
      "phase": "阶段3名称",
      "duration_days": 天数（数字）,
      "tasks": ["任务1", "任务2"]
    }
  ],
  "success_case": {
    "title": "成功案例标题",
    "background": "案例背景",
    "actions": ["做了什么1", "做了什么2"],
    "results": "结果描述",
    "lessons": ["经验教训1"]
  },
  "failure_case": {
    "title": "失败案例标题",
    "background": "案例背景",
    "mistakes": ["错误1", "错误2"],
    "lessons": ["教训1", "教训2"]
  }
}

重要要求：
1. **禁止推荐**：灰产、传销、诈骗、违规金融项目（如网络刷单、虚假交易、资金盘等）
2. **风险透明**：必须真实评估风险，不夸大收益，提供保守估计
3. **可执行性**：行动路径必须具体可行，考虑用户的时间和资金限制
4. **本土化**：考虑中国法律法规和平台规则（如微信、抖音、淘宝等）
5. **失败案例**：必须提供真实的失败教训，帮助用户避坑
6. **匹配度**：根据用户的技能、时间、资金进行精准匹配
7. **资源利用**：如果用户提供了其他可利用资源（如人脉、渠道、设备、房产、车辆等），必须优先推荐能充分利用这些资源的项目，并在项目描述和行动路径中说明如何利用这些资源
8. **用户意愿**：如果用户在补充说明中提到了特定偏好、限制或要求，必须充分考虑并尽量满足这些需求
9. **只输出JSON**：不要输出任何额外的文字说明

请直接输出JSON，不要添加任何markdown标记。`;
}

/**
 * Parse LLM response and extract JSON
 */
function parseLLMResponse(content: string): LLMRecommendationResponse {
  // Remove potential markdown code blocks
  let cleanContent = content.trim();

  // Remove ```json or ``` markers
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3);
  }

  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3);
  }

  cleanContent = cleanContent.trim();

  try {
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse LLM response:', cleanContent);
    throw new Error('LLM返回的数据格式错误');
  }
}

/**
 * Convert LLM response to ProjectRecommendation format
 */
function convertToRecommendation(
  llmResponse: LLMRecommendationResponse,
  recommendationId: string,
  userId: string
): ProjectRecommendation {
  const normalizeLevel = (level: string): 'low' | 'medium' | 'high' => {
    const normalized = level.toLowerCase();
    if (normalized === '低' || normalized === 'low') return 'low';
    if (normalized === '高' || normalized === 'high') return 'high';
    return 'medium';
  };

  return {
    id: recommendationId,
    userId,
    userSummary: llmResponse.user_summary,
    recommendationReason: llmResponse.recommendation_reason,
    title: llmResponse.title,
    summary: llmResponse.summary,
    description: llmResponse.description,
    revenue: {
      monthlyMin: llmResponse.revenue.monthly_min,
      monthlyMax: llmResponse.revenue.monthly_max,
      breakevenMonths: llmResponse.revenue.breakeven_months
    },
    startupCost: {
      min: llmResponse.startup_cost.min,
      max: llmResponse.startup_cost.max
    },
    workContent: llmResponse.work_content,
    successFactors: llmResponse.success_factors,
    riskAssessment: {
      legal: {
        level: normalizeLevel(llmResponse.risk_assessment.legal.level),
        description: llmResponse.risk_assessment.legal.description,
        mitigation: llmResponse.risk_assessment.legal.mitigation
      },
      financial: {
        level: normalizeLevel(llmResponse.risk_assessment.financial.level),
        description: llmResponse.risk_assessment.financial.description,
        mitigation: llmResponse.risk_assessment.financial.mitigation
      },
      platform: {
        level: normalizeLevel(llmResponse.risk_assessment.platform.level),
        description: llmResponse.risk_assessment.platform.description,
        mitigation: llmResponse.risk_assessment.platform.mitigation
      },
      competition: {
        level: normalizeLevel(llmResponse.risk_assessment.competition.level),
        description: llmResponse.risk_assessment.competition.description,
        mitigation: llmResponse.risk_assessment.competition.mitigation
      }
    },
    roadmap: llmResponse.roadmap.map(phase => ({
      phase: phase.phase,
      durationDays: phase.duration_days,
      tasks: phase.tasks
    })),
    successCase: {
      title: llmResponse.success_case.title,
      background: llmResponse.success_case.background,
      actions: llmResponse.success_case.actions,
      results: llmResponse.success_case.results,
      lessons: llmResponse.success_case.lessons
    },
    failureCase: {
      title: llmResponse.failure_case.title,
      background: llmResponse.failure_case.background,
      mistakes: llmResponse.failure_case.mistakes,
      lessons: llmResponse.failure_case.lessons
    },
    createdAt: new Date().toISOString()
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的副业/创业推荐顾问。请只输出有效的JSON格式，不要添加任何markdown标记或额外文字。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Call Anthropic Claude API
 */
async function callClaude(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      system: '你是一个专业的副业/创业推荐顾问。请只输出有效的JSON格式，不要添加任何markdown标记或额外文字。'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Claude API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的副业/创业推荐顾问。请只输出有效的JSON格式，不要添加任何markdown标记或额外文字。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Main function to generate recommendation using configured LLM
 */
export async function generateRecommendation(
  profile: UserProfile,
  recommendationId: string,
  userId: string,
  llmModel: string,
  llmProvider: string
): Promise<ProjectRecommendation> {
  console.log(`Generating recommendation with ${llmProvider}/${llmModel}`);

  const prompt = generatePrompt(profile);
  let llmResponse: string;

  // Call appropriate LLM based on provider
  switch (llmProvider.toLowerCase()) {
    case 'openai':
      llmResponse = await callOpenAI(prompt, llmModel);
      break;
    case 'claude':
    case 'anthropic':
      llmResponse = await callClaude(prompt, llmModel);
      break;
    case 'deepseek':
      llmResponse = await callDeepSeek(prompt, llmModel);
      break;
    default:
      // Default to OpenAI
      console.warn(`Unknown provider ${llmProvider}, falling back to OpenAI`);
      llmResponse = await callOpenAI(prompt, 'gpt-4o');
  }

  console.log('LLM response received, parsing...');

  // Parse the response
  const parsed = parseLLMResponse(llmResponse);

  // Convert to our format
  const recommendation = convertToRecommendation(parsed, recommendationId, userId);

  console.log('Recommendation generated:', recommendation.title);

  return recommendation;
}
