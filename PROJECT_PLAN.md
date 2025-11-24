# 智业罗盘（ZhiYeCompass）项目完整策划书

## 📋 项目名称

**智业罗盘**（ZhiYeCompass）
- 寓意：智慧选择业务方向，为职业发展指明方向
- 易记、有指引感、符合产品定位
- "智"字强调AI智能推荐的核心优势

---

## 一、背景分析与市场洞察

### 1.1 中国就业与副业环境现状

**宏观环境**：
- 🔴 **就业压力**：16-24岁青年失业率高企（2023年峰值超20%）
- 📉 **收入焦虑**：通货膨胀、房贷压力、医疗教育成本上升
- 🔄 **职业不稳定**：裁员潮、35岁危机、行业周期性波动
- 💡 **副业意识觉醒**：超60%职场人考虑或已开展副业

**市场缺口**：
- ❌ 现有副业内容多为"泛泛清单"，缺乏个性化匹配
- ❌ 信息真假难辨，充斥割韭菜课程和灰产诱导
- ❌ 缺少"中国本土化"的风险评估和合规性指导
- ✅ **机会**：提供可信、个性化、合规的副业/创业推荐平台

### 1.2 目标用户画像（5大核心人群）

| 人群 | 特征 | 痛点 | 期待 |
|------|------|------|------|
| **应届生/职场新人** | 22-26岁，1-3年工作经验，收入3-8K | 工资低、经验少、不知道能做什么 | 低门槛、可试错、能快速见收益 |
| **打工人/白领** | 26-35岁，5-10年经验，收入8-20K | 时间有限、怕被裁、想增加收入来源 | 下班可做、不影响主业、稳定性 |
| **全职宝妈/家庭主妇** | 28-40岁，有育儿压力，时间碎片化 | 想经济独立、时间不固定、社会脱节 | 在家可做、时间灵活、重建社交 |
| **县城/小镇青年** | 20-35岁，本地资源有限，信息闭塞 | 大城市竞争激烈、回乡机会少 | 本地化项目、利用乡土资源 |
| **技术人员/程序员** | 25-40岁，有技术能力，想变现 | 不懂商业、不知如何接单/做产品 | 技术变现路径、被动收入模式 |

### 1.3 核心痛点与解决方案

**用户痛点**：
1. 😵 **选择困难**：副业项目太多，不知道哪个适合自己
2. 🚫 **风险未知**：不清楚法律风险、平台规则、投入产出比
3. 🤔 **执行障碍**：有想法没行动，缺少具体可落地的路径
4. 💸 **被割韭菜**：付费课程、加盟骗局、虚假承诺

**我们的解决方案**：
- ✅ **个性化匹配算法**：基于用户时间、资金、技能、地域精准推荐
- ✅ **风险透明化**：每个项目明确标注法律风险、失败率、真实案例
- ✅ **行动路径拆解**：从0到1的具体步骤、工具清单、避坑指南
- ✅ **合规性保障**：只推荐合法合规项目，过滤灰产和高风险模式

### 1.4 相对竞品优势

| 维度 | 万能副业博主 | 副业清单网站 | 付费课程平台 | **职业罗盘** |
|------|--------------|--------------|--------------|--------------|
| **个性化** | ❌ 通用建议 | ❌ 静态列表 | ❌ 单一方向 | ✅ AI智能匹配 |
| **风险评估** | ⚠️ 选择性披露 | ❌ 无 | ❌ 隐瞒风险 | ✅ 透明化展示 |
| **本土化** | ⚠️ 部分适用 | ❌ 照搬国外 | ⚠️ 看运气 | ✅ 中国国情优化 |
| **可信度** | ⚠️ 利益相关 | ❌ 信息过时 | ❌ 割韭菜 | ✅ 中立、可验证 |
| **行动支持** | ❌ 讲完就跑 | ❌ 无 | ⚠️ 理论为主 | ✅ 具体路径+工具 |

---

## 二、用户输入维度优化方案

### 2.1 精简后的核心字段（MVP版）

```yaml
# 基础信息层（必填）
user_profile:
  age_range:
    type: enum
    options: [18-22, 23-26, 27-30, 31-35, 36-40, 40+]

  location:
    province: string
    city: string
    tier: enum [一线, 新一线, 二线, 三线及以下, 县城/乡镇]

  current_status:
    type: enum
    options: [在职, 待业, 学生, 全职主妇/夫, 自由职业]

  education:
    type: enum
    options: [高中及以下, 专科, 本科, 硕士及以上]

# 能力与资源层（必填）
capabilities:
  industry_background:
    type: multi_select
    options: [互联网, 教育, 金融, 制造业, 服务业, 医疗, 媒体, 电商, 其他]

  skills:
    type: multi_select
    categories:
      技术类: [编程, 设计, 视频剪辑, 写作, 数据分析]
      运营类: [社交媒体, 客服, 销售, 市场推广]
      专业类: [外语, 法律, 财务, 教学, 咨询]
      手工类: [烘焙, 手工艺, 摄影, 美妆]

  available_time:
    hours_per_week: number  # 可投入小时数
    flexibility: enum [固定时段, 碎片时间, 完全灵活]

  initial_budget:
    type: enum
    options: [0元启动, 1000元以下, 1000-5000元, 5000-1万, 1-5万, 5万以上]

# 意愿与偏好层（必填）
preferences:
  risk_tolerance:
    type: enum
    options: [极低(只接受零风险), 低(可接受小额试错), 中(愿意投入一定成本), 高(接受创业级风险)]

  commitment_level:
    type: enum
    options: [试水(5%精力), 副业(20-30%精力), 半全职(50%精力), 全职创业(100%)]

  preferred_fields:
    type: multi_select
    options: [
      线上电商, 本地服务, 内容创作, 知识付费,
      技能接单, 投资理财, 线下小店, 社交电商,
      教育培训, 代理分销, 其他
    ]

# 资源与人脉层（选填，加分项）
resources:
  team_size:
    type: enum
    options: [个人单干, 2-3人小团队, 有稳定合伙人]

  special_resources:
    type: multi_select
    options: [
      供应链资源, 企业客户资源, 社区/学校资源,
      自媒体账号(>1万粉), 线下门店, 专业资质证书,
      特殊技能(如驾照/资格证)
    ]
```

### 2.2 字段设计原则

1. **渐进式收集**：
   - 首次只填核心6-8个字段（5分钟完成）
   - 后续可补充详细信息提升推荐精度

2. **反作弊设计**：
   - 时间+资金+技能的交叉验证（避免用户虚报）
   - 推荐结果页提示"如信息不实，推荐可能不准确"

3. **动态问卷**：
   - 根据用户选择动态展示后续问题
   - 例：选"全职创业"→追问"有无创业经验"

---

## 三、推荐项目数据模型设计

### 3.1 项目库数据结构

```typescript
interface ProjectTemplate {
  // 基础信息
  id: string;
  title: string;  // 例："本地社群团购站长"
  category: ProjectCategory;  // 枚举：电商、内容、服务等
  tags: string[];  // ["社交电商", "本地化", "零库存"]

  // 适配度评分权重
  matching_criteria: {
    required_skills: Skill[];  // 必需技能
    optional_skills: Skill[];  // 加分技能
    min_time_hours_week: number;  // 最低时间投入
    ideal_time_hours_week: number;  // 理想时间投入
    min_budget: number;  // 最低启动资金
    ideal_budget: number;  // 建议资金
    suitable_locations: LocationTier[];  // 适合地域
    risk_level: RiskLevel;  // 风险等级
  };

  // 项目描述
  description: {
    summary: string;  // 一句话描述
    detailed: string;  // 详细介绍
    work_content: string[];  // 日常工作内容
    success_factors: string[];  // 成功关键因素
  };

  // 收益与投入
  economics: {
    startup_cost_range: [number, number];  // 启动成本区间
    monthly_revenue_range: [number, number];  // 月收入区间
    breakeven_months: number;  // 回本周期（月）
    profit_margin: number;  // 利润率（%）
    revenue_stability: "稳定" | "波动较大" | "看季节";
  };

  // 风险评估
  risk_assessment: {
    legal_risk: RiskItem;  // 法律风险
    financial_risk: RiskItem;  // 财务风险
    platform_risk: RiskItem;  // 平台规则风险
    competition_risk: RiskItem;  // 竞争风险
    common_failures: string[];  // 常见失败原因
    mitigation_strategies: string[];  // 风险缓解策略
  };

  // 执行路径
  action_roadmap: {
    phases: Phase[];  // 阶段性里程碑
    estimated_setup_days: number;  // 从0到上线预计天数
    tools_needed: Tool[];  // 所需工具/平台
    learning_resources: Resource[];  // 学习资源
  };

  // 真实案例
  case_studies: {
    success_cases: CaseStudy[];  // 成功案例
    failure_cases: CaseStudy[];  // 失败案例（更重要！）
  };

  // 数字化/自动化机会
  automation_opportunities: {
    area: string;  // 可优化环节
    tools: string[];  // 推荐工具
    efficiency_gain: string;  // 效率提升说明
  }[];

  // 元数据
  metadata: {
    created_at: Date;
    updated_at: Date;
    verification_status: "已验证" | "待验证" | "需更新";
    source: string;  // 信息来源
    last_reviewed: Date;  // 最后审核时间
  };
}

// 辅助类型定义
interface RiskItem {
  level: "极低" | "低" | "中" | "高" | "极高";
  description: string;
  warning_signs: string[];  // 风险信号
}

interface Phase {
  name: string;
  duration_days: number;
  tasks: string[];
  checkpoints: string[];  // 检查点
}

interface CaseStudy {
  title: string;
  background: string;  // 案例背景
  actions: string[];  // 做了什么
  results: string;  // 结果
  lessons: string[];  // 经验教训
  verification: string;  // 可验证信息（如平台截图、媒体报道链接）
}
```

### 3.2 推荐算法逻辑（MVP版）

```typescript
// 推荐评分计算
function calculateProjectScore(
  user: UserProfile,
  project: ProjectTemplate
): RecommendationScore {

  let score = 0;
  let reasons: string[] = [];
  let warnings: string[] = [];

  // 1. 技能匹配度（40%权重）
  const skillMatch = calculateSkillMatch(user.skills, project.matching_criteria);
  score += skillMatch.score * 0.4;
  if (skillMatch.score > 0.7) {
    reasons.push(`您的 ${skillMatch.matched_skills.join('、')} 技能非常匹配`);
  }

  // 2. 时间匹配度（20%权重）
  const timeMatch = user.available_time >= project.matching_criteria.min_time_hours_week;
  score += timeMatch ? 0.2 : 0;
  if (!timeMatch) {
    warnings.push(`建议每周至少投入 ${project.matching_criteria.min_time_hours_week} 小时`);
  }

  // 3. 资金匹配度（15%权重）
  const budgetMatch = user.initial_budget >= project.matching_criteria.min_budget;
  score += budgetMatch ? 0.15 : 0;

  // 4. 风险匹配度（15%权重）
  const riskMatch = isRiskAcceptable(user.risk_tolerance, project.risk_assessment);
  score += riskMatch ? 0.15 : 0;
  if (!riskMatch) {
    warnings.push(`该项目风险等级为 ${project.risk_assessment.overall_risk}，高于您的接受度`);
  }

  // 5. 地域匹配度（10%权重）
  const locationMatch = project.matching_criteria.suitable_locations.includes(user.location.tier);
  score += locationMatch ? 0.1 : 0;

  return {
    total_score: score,
    match_reasons: reasons,
    warnings: warnings,
    confidence: calculateConfidence(user, project)  // 置信度评估
  };
}
```

### 3.3 项目库初始化策略（MVP阶段）

**第一批项目（10-15个精选）**：
- ✅ 覆盖5大人群各2-3个
- ✅ 风险等级分布：低风险60%、中风险30%、高风险10%
- ✅ 包含至少3个"0成本启动"项目
- ✅ 每个项目至少1个失败案例

**数据来源**：
1. 人工收集验证：小红书、知乎、即刻的真实分享
2. 访谈调研：5-10位已有副业经验者
3. 二手资料：《副业赚钱》等书籍案例整理

**质量标准**：
- 每个项目必须有可验证的真实案例
- 风险评估必须经过法律合规检查
- 数字化机会必须提供具体工具名称

---

## 四、技术栈与系统架构

### 4.1 MVP技术选型

```yaml
前端层:
  框架: Next.js 14 (App Router)
  UI库:
    - Tailwind CSS (样式)
    - shadcn/ui (组件库)
  状态管理: React Context + Zustand (轻量级)
  表单: React Hook Form + Zod (校验)
  用户标识: UUID (存储在Session Storage + Cookie)

后端层:
  无服务器: AWS Lambda + API Gateway
  运行时: Node.js 18+
  部署区域: ca-central-1 (加拿大中部)

数据层:
  主数据库: AWS DynamoDB
    用途:
      - 用户画像数据（临时存储，无需登录）
      - 推荐记录索引（推荐ID列表）
      - 系统配置（每小时限额、LLM选择等）
    理由:
      - 无服务器，按需付费，MVP成本极低
      - 单表设计适合MVP快速迭代
      - 与Lambda集成无缝

  文件存储: AWS S3
    用途:
      - LLM生成的推荐结果（JSON格式）
      - 推荐分享数据（公开访问）
      - 历史推荐内容缓存
    存储结构:
      recommendations/<recommendation_id>.json

AI层:
  多LLM支持（可动态切换）:
    - Claude 3.5 Sonnet (AWS Bedrock) - 默认
    - OpenAI GPT-4 (API)
    - DeepSeek (API) - 成本优化选项

  用途:
    - 根据用户画像动态生成项目推荐（完整内容）
    - 无需预置项目库，完全AI生成
    - 生成后存储到S3供历史查看和分享

  配置管理:
    - 后台可切换使用的LLM模型
    - 每小时推荐次数限额（防止成本失控）

后台管理:
  框架: Next.js Admin Pages (shadcn/ui)
  功能:
    - 系统配置：每小时限额设置
    - LLM模型选择和切换
    - 推荐记录查看和统计
    - 用户反馈管理

基础设施:
  部署: AWS EC2 (前后端统一部署)
    - 前端: Next.js Build产物
    - 后端: Lambda函数（通过API Gateway调用）
    - 优势: 统一管理、降低复杂度

  监控: AWS CloudWatch
  域名/CDN: Cloudflare (中国访问优化)
```

**关键架构决策**：

**1. 无项目库 = 完全LLM生成**
- ✅ 减少人工维护成本
- ✅ 推荐内容永远最新（LLM知识更新）
- ✅ 更个性化（根据画像生成）
- ⚠️ 成本风险：需要每小时限额控制

**2. AWS EC2部署（非Vercel）**
- ✅ 更好控制服务器资源
- ✅ 避免Vercel对Serverless函数的限制
- ✅ 统一部署前后端，简化管理
- ⚠️ 需要自行配置CI/CD

**3. Lambda在ca-central-1**
- ✅ 符合用户部署偏好
- ⚠️ LLM调用可能较慢（但可接受，因生成内容丰富）
- ✅ 可通过缓存机制优化响应速度

**4. S3存储推荐结果**
- ✅ 支持历史查看（通过推荐ID）
- ✅ 支持公开分享（生成分享链接）
- ✅ 成本低（按存储量付费）
- ✅ 高可用性

### 4.2 系统架构图

```
┌──────────────────────────────────────────────────────────────┐
│                     用户层 (浏览器)                            │
│  - 用户画像表单输入                                           │
│  - 单个项目推荐展示 (含风险提示)                              │
│  - 历史推荐浏览 (通过Session Storage中的推荐ID列表)          │
│  - 分享链接生成和访问                                        │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│            AWS EC2 (Next.js Application)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  前端页面:                                              │  │
│  │   /          - 用户画像表单                            │  │
│  │   /recommendation/:id  - 推荐详情页                    │  │
│  │   /history   - 历史推荐列表                            │  │
│  │   /share/:id - 公开分享页                              │  │
│  │                                                         │  │
│  │  后台页面 (需认证):                                     │  │
│  │   /admin     - 系统配置 (限额、LLM选择)                │  │
│  │   /admin/stats - 推荐统计                              │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│            AWS API Gateway + Lambda (ca-central-1)            │
│                                                               │
│  API端点:                                                     │
│  POST   /api/generate-recommendation  - 生成推荐              │
│  GET    /api/recommendation/:id       - 获取推荐详情          │
│  GET    /api/recommendations          - 获取历史推荐列表      │
│  POST   /api/feedback                 - 提交反馈              │
│  GET    /api/check-quota              - 检查限额              │
│                                                               │
│  Lambda函数:                                                  │
│  ┌──────────────────┐  ┌─────────────────┐                  │
│  │ RecommendEngine  │  │ QuotaChecker    │                  │
│  │ (主推荐逻辑)      │  │ (限额检查)      │                  │
│  └────────┬─────────┘  └────────┬────────┘                  │
│           │                     │                            │
│           ▼                     ▼                            │
│  ┌──────────────────────────────────────────────┐           │
│  │  多LLM支持 (可动态切换):                     │           │
│  │  - Claude 3.5 Sonnet (Bedrock) [默认]       │           │
│  │  - OpenAI GPT-4                              │           │
│  │  - DeepSeek                                  │           │
│  │                                               │           │
│  │  Prompt: 根据用户画像生成完整副业/创业项目   │           │
│  │  输出: 项目描述 + 风险评估 + 行动路径 + 案例 │           │
│  └──────────────────────────────────────────────┘           │
└─────────┬───────────────────────────┬────────────────────────┘
          │                           │
          ▼                           ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│   AWS DynamoDB       │   │       AWS S3 Bucket               │
│                      │   │                                   │
│  单表设计:            │   │  存储结构:                        │
│  - 用户画像 (临时)    │   │  recommendations/                 │
│  - 推荐ID列表        │   │    ├─ {uuid}.json (推荐结果)      │
│  - 系统配置          │   │    └─ shared/{uuid}.json (分享)   │
│    * 每小时限额      │   │                                   │
│    * LLM选择         │   │  访问模式:                        │
│  - 限额计数器        │   │  - 历史查看: 通过ID获取            │
│  - 用户反馈          │   │  - 公开分享: 生成临时访问URL       │
│                      │   │  - 缓存策略: 24h内相同画像复用     │
└──────────────────────┘   └──────────────────────────────────┘
```

**架构核心流程**：

1. **用户提交画像** → 生成UUID存储到Session Storage + Cookie
2. **检查限额** → DynamoDB查询当前小时推荐次数
3. **生成推荐** → Lambda调用LLM（可配置）生成完整项目
4. **存储结果** → S3保存JSON，DynamoDB记录推荐ID
5. **展示推荐** → 前端渲染单个项目（含风险提示）
6. **浏览历史** → 从Session读取ID列表，从S3获取内容
7. **分享链接** → 生成/share/:id链接，任何人可访问

### 4.3 数据表设计（DynamoDB单表模型）

```typescript
// 主表: ZhiYeCompass-Main
interface DynamoDBItem {
  PK: string;  // Partition Key
  SK: string;  // Sort Key
  GSI1PK?: string;  // Global Secondary Index 1 PK
  GSI1SK?: string;  // Global Secondary Index 1 SK
  // ... 其他属性
}

// 访问模式设计
/**
 * 1. 按用户ID查询用户信息
 *    PK = USER#<userId>
 *    SK = PROFILE
 *
 * 2. 按用户ID查询推荐历史
 *    PK = USER#<userId>
 *    SK begins_with REC#
 *
 * 3. 按项目ID查询项目详情
 *    PK = PROJECT#<projectId>
 *    SK = METADATA
 *
 * 4. 按分类查询所有项目
 *    GSI1PK = CATEGORY#<category>
 *    GSI1SK = PROJECT#<projectId>
 */
```

---

## 五、SuperClaude Framework 开发工作流设计

### 5.1 项目文档体系设计

#### PLANNING.md - 项目规划文档

```markdown
# 职业罗盘（ZhiYeCompass）项目规划

## 产品愿景
帮助中国用户找到适合自己的副业/创业项目，通过AI驱动的个性化推荐，降低试错成本，提升成功概率。

## 核心设计原则
1. **合规优先**：所有推荐项目必须合法合规，过滤灰产和高风险模式
2. **真实透明**：展示真实案例，包括失败案例，不夸大收益
3. **本土化**：深度适配中国法律、平台规则、市场环境
4. **可执行性**：每个推荐都有具体行动路径，不只是泛泛建议
5. **持续优化**：基于用户反馈迭代推荐算法和项目库

## 质量标准
- 推荐准确率目标：70%+（用户认为"非常匹配"或"比较匹配"）
- 项目验证要求：每个项目至少1个可验证的真实案例
- 风险披露要求：必须明确标注法律、财务、平台风险
- 响应速度：首屏加载<2s，推荐结果生成<3s

## 技术架构关键决策
- **前端**：Next.js App Router（利用RSC减少客户端JS）
- **后端**：Lambda（成本优化，按需扩展）
- **数据库**：DynamoDB（MVP阶段免费额度足够）
- **AI**：Claude（推理能力强，成本适中）

## MVP范围界定
**包含**：
- 用户画像填写（8个核心字段）
- 推荐列表页（展示Top 5-10个项目）
- 项目详情页（含风险评估、行动路径、案例）
- 基础反馈机制（有用/无用按钮）

**不包含**（后续版本）：
- 用户账号系统（MVP用sessionStorage暂存）
- 运营后台（用脚本维护项目库）
- 社区功能（评论、问答）
- 支付功能

## 迭代计划
- v0.1 (MVP): 核心推荐流程 (2周)
- v1.0: 用户系统+收藏功能 (1周)
- v1.1: 运营后台+项目审核流程 (2周)
- v1.2: 社区模块+用户案例分享 (3周)
```

#### TASK.md - 任务管理文档

```markdown
# 职业罗盘 - 任务看板

## 当前迭代: MVP v0.1 (Sprint 1)

### Must Have (P0)
- [ ] 用户画像表单页面 (3天)
  - [ ] 设计8个核心字段的表单组件
  - [ ] 集成React Hook Form + Zod校验
  - [ ] 实现渐进式表单（分步填写）

- [ ] 推荐引擎Lambda函数 (4天)
  - [ ] 实现评分算法（技能、时间、资金、风险匹配）
  - [ ] 集成Claude API生成推荐理由
  - [ ] 错误处理和降级策略

- [ ] 推荐列表页 (2天)
  - [ ] 卡片式项目展示
  - [ ] 匹配度分数可视化
  - [ ] 推荐理由展示

- [ ] 项目详情页 (3天)
  - [ ] 项目完整信息展示
  - [ ] 风险评估可视化（雷达图）
  - [ ] 行动路径时间轴组件

- [ ] 项目库初始化 (2天)
  - [ ] 收集10个精选项目
  - [ ] 数据验证和结构化
  - [ ] DynamoDB数据导入脚本

### Should Have (P1)
- [ ] 反馈机制 (1天)
- [ ] SEO优化 (1天)
- [ ] 移动端适配 (2天)

### Could Have (P2)
- [ ] 分享功能
- [ ] 数据埋点

### Won't Have This Sprint
- 用户登录系统
- 运营后台
- 支付功能

---

## 技术债务追踪
- [ ] DynamoDB查询性能优化（当项目数>100时）
- [ ] Claude API调用成本监控
- [ ] 前端Bundle Size优化

---

## 下一迭代计划 (v1.0)
- 用户账号系统（OAuth登录）
- 收藏和历史记录
- 推荐结果分享功能
```

#### KNOWLEDGE.md - 知识沉淀文档

```markdown
# 职业罗盘 - 项目知识库

## 中国副业/创业环境特殊性

### 法律与合规
1. **平台规则风险**
   - 微信生态：封号风险高（诱导分享、外链跳转）
   - 淘宝/拼多多：保证金门槛、平台抽成规则
   - 小红书：软广限制、MCN机构准入

2. **税务合规**
   - 个人副业收入：年收入>12万需申报个税
   - 个体工商户：适合月入>5万的副业
   - 灰色地带：私域交易、现金交易风险

3. **劳动法限制**
   - 竞业禁止：某些行业员工不能做同行副业
   - 保密协议：离职后项目选择受限

### 常见副业误区与陷阱
1. **加盟骗局特征**
   - 承诺"躺赚"、"月入X万"
   - 要求高额加盟费（>1万）
   - 无真实运营案例

2. **培训课程陷阱**
   - 免费引流课→高价进阶课套路
   - "大师"背书但无可验证成果
   - 社群运营实为传销拉人头

3. **平台政策变化**
   - 抖音：从流量红利到内卷（2023年后）
   - 闲鱼：二手交易限制收紧
   - 外卖骑手：平台抽成逐年提高

### 推荐算法优化经验
1. **地域因素权重**
   - 一线城市：线上项目优先（竞争激烈，线下成本高）
   - 县城/乡镇：本地服务项目权重+30%

2. **时间投入校准**
   - 用户自报时间常虚高20-30%
   - 建议在匹配时乘以0.7系数

3. **技能自评偏差**
   - "会PS"实际水平差异大
   - 需追问具体场景（如"能否独立设计海报"）

### 技术实现注意事项
1. **Claude API调用**
   - 推荐理由生成：控制在100 tokens内（成本优化）
   - Prompt模板：包含"禁止夸大收益"指令

2. **DynamoDB使用**
   - 避免Scan操作（成本高）
   - 项目列表查询用GSI索引

3. **前端性能**
   - 项目图片懒加载（Intersection Observer）
   - 推荐列表虚拟滚动（react-window）

### 用户研究洞察
1. **决策心理**
   - 用户更信任"失败案例"而非成功故事
   - "每天30分钟"比"每周3小时"更有吸引力（同样时长）

2. **信任建立**
   - 展示"数据来源"增加可信度
   - "已有X人尝试"社会证明有效

### 竞品分析
1. **副业蛙**：侧重课程销售，推荐不够中立
2. **副业赚钱**（App）：项目列表陈旧，缺少更新
3. **知乎副业话题**：信息分散，难以筛选

---

## 常见问题FAQ（持续补充）
Q: 为什么不直接用ChatGPT生成推荐？
A: GPT容易产生幻觉，对中国本土化场景理解不足，需要结构化数据+规则引擎兜底。

Q: 项目库如何保持更新？
A: v1.2版本计划引入"用户提交项目"功能+人工审核，形成众包模式。
```

---

### 5.2 SuperClaude日常开发循环

#### 标准工作流（可重复执行）

```bash
# ====================================
# 阶段1: 需求理解与任务拆解
# ====================================

# 1.1 激活项目上下文
/sc:load zhiyecompass

# 1.2 头脑风暴当前迭代目标
/sc:brainstorm "本周要实现用户画像表单页面，包括8个核心字段的收集和校验"

# 输出：
# - 功能拆解建议
# - 潜在风险点
# - 技术方案选项

# 1.3 更新任务列表
/sc:pm update TASK.md with:
  - 新增任务: "实现用户画像表单（8字段）"
  - 拆分子任务: 表单UI、校验逻辑、数据提交
  - 标记优先级: P0

# ====================================
# 阶段2: 调研与技术选型
# ====================================

# 2.1 调研最佳实践
/sc:research "React Hook Form + Zod 多步骤表单最佳实践 2024"
# 触发: Tavily搜索 + Context7查询官方文档

# 2.2 调研中国本土化注意事项
/sc:research "中国副业法律风险 个人所得税申报规则"
# 更新到: KNOWLEDGE.md

# 2.3 技术方案设计
/sc:design "用户画像表单数据模型 + API接口设计"
# 输出: TypeScript接口定义 + API规格文档

# ====================================
# 阶段3: 实现（前后端并行）
# ====================================

# 3.1 前端实现
/sc:implement "创建 app/onboarding/page.tsx 用户画像表单页面，使用shadcn/ui组件"
# 自动:
#   - 生成表单组件代码
#   - 集成React Hook Form
#   - 配置Zod校验规则

# 3.2 后端实现
/sc:implement "创建 AWS Lambda函数 saveUserProfile，保存用户画像到DynamoDB"
# 自动:
#   - 生成Lambda Handler代码
#   - DynamoDB Put操作
#   - 错误处理逻辑

# 3.3 AI集成
/sc:implement "集成Claude API生成用户画像补全建议"
# 自动:
#   - Prompt模板设计
#   - API调用封装
#   - 降级策略

# ====================================
# 阶段4: 测试与验证
# ====================================

# 4.1 生成测试用例
/sc:test "为用户画像表单生成单元测试和集成测试"
# 自动:
#   - Jest + React Testing Library测试
#   - Lambda函数单元测试
#   - DynamoDB Mock测试

# 4.2 运行测试
npm test

# 4.3 手动验证
/sc:implement "创建Playwright E2E测试：完整表单填写流程"
# 触发: Playwright MCP
# 验证: 表单校验、提交成功、错误处理

# ====================================
# 阶段5: 文档与提交
# ====================================

# 5.1 自动生成文档
/sc:document "用户画像表单组件使用说明"
# 输出: JSDoc注释 + README更新

# 5.2 代码审查
/sc:analyze --focus security,quality "app/onboarding/**"
# 检查: 安全漏洞、代码质量、性能问题

# 5.3 Git提交
/sc:git commit "feat: 实现用户画像表单（8核心字段）"
# 自动: 生成规范化commit message

# 5.4 保存会话
/sc:save "完成用户画像表单MVP版本"
# 更新: Serena项目记忆
```

---

### 5.3 端到端功能实现示例

#### 示例：实现"个性化推荐列表页"功能

```bash
# ====================================
# 步骤1: 加载项目并设定目标
# ====================================

/sc:load zhiyecompass

/sc:brainstorm "
需求：实现推荐列表页面，展示Top 10推荐项目
要求：
1. 根据用户画像调用推荐引擎Lambda
2. 展示项目卡片（包含匹配度分数、推荐理由）
3. 点击卡片跳转详情页
4. 移动端自适应
"

# AI输出：
# ✅ 技术方案建议：
#   - Next.js Server Component获取推荐数据（减少客户端JS）
#   - shadcn/ui Card组件 + Badge展示匹配度
#   - Framer Motion添加加载动画
# ⚠️ 注意事项：
#   - 处理推荐引擎API失败降级
#   - 分页/虚拟滚动（当项目数>20时）
# 🤔 需要确认：
#   - 匹配度分数如何可视化？（进度条/星级/百分比）

# ====================================
# 步骤2: 调研与设计
# ====================================

/sc:research "
查询以下内容：
1. Next.js 14 Server Component数据获取最佳实践
2. 中国用户对推荐系统的信任度影响因素（学术研究）
"

# 触发工具：
# - Context7: Next.js官方文档
# - Tavily: 学术搜索推荐系统研究

/sc:design "
设计推荐列表数据流：
1. 用户画像 → Lambda推荐引擎
2. 推荐引擎 → DynamoDB查询项目详情
3. Claude生成个性化推荐理由
4. 返回结构化JSON
"

# AI输出：TypeScript接口定义
interface RecommendationResponse {
  recommendations: Array<{
    project_id: string;
    match_score: number;  // 0-100
    reasons: string[];    // 推荐理由（3-5条）
    warnings: string[];   // 注意事项
    project_snapshot: ProjectSummary;  // 项目基础信息
  }>;
  metadata: {
    generated_at: string;
    confidence: number;
    alternative_count: number;  // 备选项目数量
  };
}

# ====================================
# 步骤3: 并行实现前后端
# ====================================

# 3.1 前端页面实现
/sc:implement "
创建 app/recommendations/page.tsx:
1. Server Component从API获取推荐数据
2. 使用shadcn/ui Card组件展示项目
3. 匹配度用进度条可视化（0-100分）
4. 推荐理由用带图标的列表展示
5. 添加骨架屏Loading状态
"

# AI自动生成：
# ✅ app/recommendations/page.tsx
# ✅ components/ProjectCard.tsx
# ✅ components/MatchScoreBar.tsx
# ✅ 集成Tailwind动画

# 3.2 后端Lambda实现
/sc:implement "
创建 lambda/recommendationEngine.ts:
1. 接收用户画像JSON
2. 从DynamoDB查询所有项目
3. 调用评分算法计算匹配度
4. 调用Claude生成个性化推荐理由（控制在100 tokens）
5. 返回Top 10推荐
6. 添加错误处理和降级（Claude失败时用模板理由）
"

# AI自动生成：
# ✅ lambda/recommendationEngine.ts
# ✅ lib/scoringAlgorithm.ts (评分算法)
# ✅ lib/claudePrompts.ts (Prompt模板)
# ✅ 错误处理和日志

# 3.3 集成Claude API
/sc:implement "
在recommendationEngine.ts中集成Claude API:
- 使用AWS Bedrock调用Claude 3.5 Sonnet
- Prompt模板：'为用户{user_profile}推荐项目{project_title}时，生成3-5条简洁理由，禁止夸大收益'
- 添加Token使用监控
"

# ====================================
# 步骤4: 测试验证
# ====================================

# 4.1 单元测试
/sc:test "
为推荐引擎生成测试：
1. 评分算法单元测试（边界值测试）
2. Lambda函数集成测试（Mock DynamoDB和Claude）
3. 前端组件测试（快照测试 + 用户交互）
"

# 4.2 E2E测试
/sc:implement "
创建Playwright测试:
test('用户完成画像后看到推荐列表', async ({ page }) => {
  // 1. 填写用户画像表单
  // 2. 提交后跳转推荐列表
  // 3. 验证至少显示5个项目卡片
  // 4. 验证匹配度分数显示
  // 5. 点击第一个项目进入详情页
})
"

# 4.3 性能测试
/sc:analyze --focus performance "
检查推荐列表页性能:
- 首屏加载时间（目标<2s）
- Claude API调用时间
- DynamoDB查询性能
"

# ====================================
# 步骤5: 优化与部署
# ====================================

# 5.1 代码审查
/sc:analyze --focus security,quality "
审查以下代码:
- app/recommendations/**
- lambda/recommendationEngine.ts
检查: SQL注入、XSS、敏感信息泄露、代码重复
"

# 5.2 生成文档
/sc:document "
为推荐引擎API生成文档:
- 接口规格（OpenAPI格式）
- 评分算法说明
- Claude Prompt模板说明
"

# 5.3 部署检查
/sc:build "
构建并检查:
1. Next.js生产构建（npm run build）
2. Lambda部署包大小检查（<50MB）
3. 环境变量配置验证
"

# 5.4 Git提交
/sc:git commit "
feat: 实现个性化推荐列表页

- 新增Server Component推荐列表页
- 集成Lambda推荐引擎
- Claude AI生成个性化推荐理由
- 添加完整测试覆盖

测试: Playwright E2E通过
性能: 首屏加载1.8s（✅达标）
"

# 5.5 保存会话
/sc:save "完成推荐列表页核心功能，包含Claude AI集成"
```

---

## 六、MVP范围与迭代路线图

### 6.1 MVP v0.1（2周冲刺）

#### 核心功能清单

**Week 1: 基础设施 + 用户画像**
```yaml
Day 1-2: 项目初始化
  - ✅ Next.js项目搭建
  - ✅ shadcn/ui组件库集成
  - ✅ AWS环境配置（Lambda + DynamoDB + Bedrock）
  - ✅ Git仓库和CI/CD流水线

Day 3-5: 用户画像模块
  - ✅ 8字段表单页面
  - ✅ Zod校验规则
  - ✅ 渐进式填写体验
  - ✅ 数据提交到DynamoDB

Day 6-7: 项目库初始化
  - ✅ 收集10个精选项目
  - ✅ 数据结构化（符合ProjectTemplate接口）
  - ✅ DynamoDB数据导入
  - ✅ 人工验证（法律合规检查）
```

**Week 2: 推荐引擎 + 展示页面**
```yaml
Day 8-10: 推荐引擎
  - ✅ Lambda推荐引擎实现
  - ✅ 评分算法（4维度匹配）
  - ✅ Claude API集成（推荐理由生成）
  - ✅ 错误处理和降级

Day 11-12: 推荐列表页
  - ✅ Server Component数据获取
  - ✅ 项目卡片组件
  - ✅ 匹配度可视化
  - ✅ 移动端适配

Day 13-14: 项目详情页 + 收尾
  - ✅ 详情页完整信息展示
  - ✅ 风险评估可视化
  - ✅ 行动路径时间轴
  - ✅ E2E测试
  - ✅ 性能优化
  - ✅ 部署上线
```

#### 验收标准
- ✅ 用户可完整填写画像并获得推荐
- ✅ 推荐准确率≥60%（内部测试10人样本）
- ✅ 首屏加载<2s，推荐生成<3s
- ✅ 移动端完美适配
- ✅ 无P0/P1级Bug

---

### 6.2 后续迭代规划

#### v1.0（+1周）：用户系统与持久化

**新增功能**：
```yaml
用户账号系统:
  - OAuth登录（微信/QQ）
  - 用户画像保存和编辑
  - 推荐历史记录

收藏功能:
  - 收藏感兴趣的项目
  - 收藏夹管理

分享功能:
  - 生成推荐结果分享卡片
  - 微信小程序码（如已有小程序）
```

**SuperClaude工作流**：
```bash
/sc:brainstorm "设计用户系统架构，需考虑中国OAuth平台限制"
/sc:research "微信OAuth 2.0集成最佳实践 2024"
/sc:implement "Next-Auth集成微信登录"
/sc:test "用户登录流程E2E测试"
```

**预期收益**：
- 用户留存率+40%
- 可收集用户行为数据优化推荐算法

---

#### v1.1（+2周）：运营后台与项目审核

**新增功能**：
```yaml
运营后台:
  - 项目库CRUD管理
  - 项目审核工作流（待审核/已通过/已拒绝）
  - 用户反馈查看

半自动化项目入库:
  - 爬虫抓取副业案例（小红书/知乎）
  - AI预处理（Claude提取结构化信息）
  - 人工审核确认

数据分析:
  - 推荐准确率监控
  - 项目热度排行
  - 用户画像分布统计
```

**SuperClaude工作流**：
```bash
/sc:design "运营后台权限模型和审核流程"
/sc:implement "基于shadcn/ui的管理后台（使用DataTable组件）"
/sc:implement "项目爬虫+Claude结构化提取脚本"
# 使用Playwright MCP抓取公开内容
```

**技术债务处理**：
```bash
/sc:cleanup "清理重复代码，优化DynamoDB查询性能"
/sc:refactor "推荐引擎模块化，支持A/B测试不同算法"
```

---

#### v1.2（+3周）：社区与用户生成内容

**新增功能**：
```yaml
用户案例分享:
  - 用户提交自己的副业经历
  - 收入证明截图上传（打码处理）
  - 点赞和评论

问答社区:
  - 用户提问"XX项目怎么做"
  - AI+人工辅助回答
  - 优质问答沉淀到KNOWLEDGE.md

项目众包:
  - 用户提交新项目建议
  - 社区投票+运营审核
  - 通过后加入项目库
```

**SuperClaude工作流**：
```bash
/sc:research "UGC社区内容审核机制（合规性考虑）"
/sc:implement "Claude驱动的内容审核AI（识别违规内容）"
/sc:business-panel "社区运营策略分析" --experts "godin,drucker,meadows"
# 使用Business Panel分析社区冷启动策略
```

**关键指标**：
- 月活用户>1000
- UGC内容贡献率>15%
- 推荐准确率>75%

---

#### v2.0（+1个月）：AI驱动的深度个性化

**新增功能**：
```yaml
AI对话式推荐:
  - 类ChatGPT的对话界面
  - 多轮对话深挖用户需求
  - 动态调整推荐结果

智能行动助手:
  - 为选定项目生成"30天启动计划"
  - 每日任务推送
  - 进度追踪和调整建议

成功率预测:
  - 基于历史数据训练模型
  - 预测用户做某项目的成功概率
  - 提供针对性改进建议
```

**SuperClaude工作流**：
```bash
/sc:design "对话式推荐系统架构（流式响应+上下文管理）"
/sc:implement "Claude长对话上下文管理（Prompt优化）"
/sc:analyze --focus performance "Claude API调用成本优化方案"
# 使用Sequential MCP进行多步推理优化
```

---

### 6.3 持续优化与SuperClaude集成

#### 每次迭代的固定流程

```bash
# ====================================
# 迭代启动
# ====================================
/sc:load zhiyecompass
/sc:pm review TASK.md  # 查看上一迭代遗留任务
/sc:brainstorm "v1.1迭代目标：运营后台+项目审核"
/sc:pm update TASK.md  # 生成新迭代任务列表

# ====================================
# 迭代中
# ====================================
每日站会后:
  /sc:pm show progress  # 可视化任务进度

遇到技术难题:
  /sc:research "具体问题关键词"
  /sc:sequential "系统性分析问题（使用Sequential MCP）"

代码实现:
  /sc:implement "具体功能描述"

踩坑后:
  /sc:reflect "记录失败教训到KNOWLEDGE.md"

# ====================================
# 迭代结束
# ====================================
/sc:test --comprehensive  # 完整测试套件
/sc:analyze --all  # 代码质量、安全、性能全面分析
/sc:document "本迭代新增功能说明"
/sc:git commit "feat(v1.1): 运营后台和项目审核功能"
/sc:save "v1.1迭代完成，待部署生产"
```

#### KNOWLEDGE.md的持续更新

```bash
# 每周五固定任务：
/sc:pm exec "
整理本周踩坑和经验：
1. 从Git提交历史提取'fix'和'refactor'相关commit
2. 总结到KNOWLEDGE.md相应章节
3. 更新常见问题FAQ
"

# 每个月：
/sc:research "中国副业市场最新政策变化"
/sc:pm update KNOWLEDGE.md  # 更新法律合规章节

# 重大事件触发：
当Claude API政策变更:
  /sc:research "Claude API最新定价和限制"
  /sc:reflect "评估成本影响，记录到KNOWLEDGE.md"
```

---

## 七、风险管理与应对策略

### 7.1 合规风险

**风险点**：
- 推荐的项目涉及灰产或违规
- 用户基于推荐从事违法活动

**应对策略**：
```yaml
预防措施:
  - 项目入库前法律合规审查（必需）
  - 每个项目页面显示免责声明
  - 高风险项目额外警告弹窗

技术手段:
  - Claude内容审核（检测违规关键词）
  - 用户举报机制
  - 定期人工抽查项目库

免责声明示例:
  "本平台仅提供信息参考，不构成投资或法律建议。
   用户需自行判断项目合法性与可行性，并承担相应风险。"
```

**SuperClaude集成**：
```bash
/sc:implement "创建项目合规检查脚本（Claude驱动）"
# 检查项目描述中的敏感词、夸大宣传、灰产特征
```

---

### 7.2 AI成本风险

**风险点**：
- Claude API调用成本失控（用户量增长）

**应对策略**：
```yaml
成本控制:
  - 推荐理由生成限制100 tokens
  - 相同用户画像24h内缓存推荐结果
  - Claude失败时降级到规则模板

监控告警:
  - 设置月度预算告警（AWS Budgets）
  - 每日成本监控Dashboard
  - Token使用量趋势分析

长期优化:
  - v2.0考虑自训练小模型替代部分Claude调用
  - 探索更便宜的AI服务（如DeepSeek）
```

**SuperClaude工作流**：
```bash
/sc:analyze --focus performance "
分析Claude API调用模式:
- 哪些场景Token消耗最多
- 是否有冗余调用
- 缓存命中率
"

/sc:implement "Claude调用成本监控Dashboard（CloudWatch + Lambda）"
```

---

### 7.3 推荐准确率风险

**风险点**：
- 推荐不准导致用户流失
- 负面口碑传播

**应对策略**：
```yaml
数据驱动优化:
  - A/B测试不同推荐算法
  - 收集用户反馈（有用/无用按钮）
  - 分析高分项目和低分项目的共同特征

快速迭代:
  - 每周根据反馈调整算法权重
  - 每月更新项目库（淘汰过时项目）

用户期望管理:
  - 首页明确说明"推荐基于算法，仅供参考"
  - 提供"不满意推荐？优化画像"入口
```

**SuperClaude集成**：
```bash
/sc:analyze "
分析推荐失败案例:
- 用户画像: {data}
- 推荐结果: {projects}
- 用户反馈: 不匹配
找出算法缺陷
"

/sc:improve "根据分析结果优化评分算法"
```

---

## 八、成功指标与数据监控

### 8.1 核心KPI（MVP阶段）

```yaml
产品指标:
  - 推荐准确率: >60%（目标）
    测量: 用户点击"有用"按钮的比例

  - 用户留存率: Day 7 >30%
    测量: 7天内再次访问的用户比例

  - 项目详情页查看率: >80%
    测量: 看到推荐后点击查看详情的比例

技术指标:
  - 首屏加载时间: <2s
  - 推荐生成时间: <3s
  - API成功率: >99%
  - Claude API成本: <$50/月（前100用户）

业务指标:
  - 注册用户数: MVP阶段目标100人
  - 分享率: >15%
  - 用户反馈量: >50条/月
```

### 8.2 数据监控Dashboard

```bash
# 使用SuperClaude实现监控
/sc:implement "
创建实时监控Dashboard:
1. Vercel Analytics集成（前端性能）
2. CloudWatch Dashboard（Lambda指标）
3. 自定义Metrics:
   - 推荐准确率
   - Claude Token使用量
   - 项目热度排行
"
```

---

## 九、总结：从0到1的完整路径

### 快速启动Checklist

```bash
# Day 1: 项目初始化
[ ] git clone <repo>
[ ] npm install
[ ] 配置AWS账号（Lambda + DynamoDB + Bedrock）
[ ] /sc:load zhiyecompass
[ ] /sc:pm init  # 初始化任务管理

# Day 2-3: 环境搭建
[ ] Next.js + shadcn/ui集成
[ ] Lambda本地开发环境（SAM CLI）
[ ] DynamoDB本地调试（DynamoDB Local）
[ ] /sc:implement "项目基础架构代码"

# Day 4-7: 核心功能开发
[ ] /sc:implement "用户画像表单"
[ ] /sc:implement "推荐引擎Lambda"
[ ] /sc:implement "推荐列表页"
[ ] /sc:test "E2E测试"

# Day 8-10: 项目库准备
[ ] 收集10个精选项目
[ ] /sc:research "项目合规性检查"
[ ] 数据导入DynamoDB
[ ] 人工验证

# Day 11-14: 收尾与上线
[ ] /sc:implement "项目详情页"
[ ] /sc:analyze --all
[ ] /sc:build
[ ] /sc:git commit "feat: MVP v0.1"
[ ] 部署到生产环境
[ ] /sc:save "MVP v0.1上线"
```

---

### 核心SuperClaude命令速查

| 场景 | 命令 | 说明 |
|------|------|------|
| **项目启动** | `/sc:load zhiyecompass` | 加载项目上下文 |
| **需求分析** | `/sc:brainstorm "需求描述"` | 头脑风暴和拆解 |
| **任务管理** | `/sc:pm update TASK.md` | 更新任务列表 |
| **技术调研** | `/sc:research "关键词"` | 深度调研（Tavily+Context7） |
| **架构设计** | `/sc:design "系统模块"` | 架构和接口设计 |
| **代码实现** | `/sc:implement "功能描述"` | AI辅助编码 |
| **测试生成** | `/sc:test "测试场景"` | 自动生成测试 |
| **代码分析** | `/sc:analyze --focus security` | 安全/性能/质量分析 |
| **文档生成** | `/sc:document "模块名"` | 自动生成文档 |
| **代码清理** | `/sc:cleanup "目标目录"` | 清理冗余代码 |
| **Git提交** | `/sc:git commit "消息"` | 规范化提交 |
| **会话保存** | `/sc:save "里程碑描述"` | 保存项目状态 |
| **商业分析** | `/sc:business-panel @doc.pdf` | 多专家分析 |

---

### 最后的建议

1. **先做减法再做加法**：MVP阶段克制功能欲望，只做核心流程
2. **真实数据驱动**：不要YY用户需求，尽早找10个真实用户测试
3. **合规是红线**：宁可推荐项目少，也不要碰灰产边缘
4. **持续学习**：用KNOWLEDGE.md沉淀经验，让AI越来越懂你的项目
5. **拥抱SuperClaude**：熟练使用/sc:*命令，开发效率提升3-5倍

---

**祝项目顺利！有任何问题随时使用 `/sc:brainstorm` 与我讨论 🚀**
