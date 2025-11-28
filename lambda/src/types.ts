/**
 * Type definitions for ZhiYeCompass Lambda
 */

/** 其他资源信息 */
export interface OtherResources {
  /** 选中的资源类型 */
  resourceTypes: string[];
  /** 详细描述 */
  description: string;
}

export interface UserProfile {
  uuid: string;
  ageRange: string;
  location: {
    province: string;
    city: string;
    cityLevel: string;
  };
  currentStatus: string;
  education: string;
  industryBackground: string[];
  skills: string[];
  availableTimePerWeek: number;
  startupBudget: string;
  /** 用户拥有的其他资源（可选） */
  otherResources?: OtherResources;
  /** 自定义输入字段（当用户选择"其他"时） */
  customAgeRange?: string;
  customCityLevel?: string;
  customCurrentStatus?: string;
  customEducation?: string;
  customStartupBudget?: string;
  customIndustryBackground?: string;
  customSkills?: string;
  /** 整体补充说明 */
  overallDescription?: string;
}

export interface RiskDetail {
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string[];
}

export interface RoadmapPhase {
  phase: string;
  durationDays: number;
  tasks: string[];
}

export interface CaseStudy {
  title: string;
  background: string;
  actions?: string[];
  mistakes?: string[];
  results?: string;
  lessons: string[];
}

export interface ProjectRecommendation {
  id: string;
  userId: string;
  /** AI生成的用户情况摘要 */
  userSummary: string;
  /** AI推荐该项目的理由 */
  recommendationReason: string;
  title: string;
  summary: string;
  description: string;
  revenue: {
    monthlyMin: number;
    monthlyMax: number;
    breakevenMonths: number;
  };
  startupCost: {
    min: number;
    max: number;
  };
  workContent: string[];
  successFactors: string[];
  riskAssessment: {
    legal: RiskDetail;
    financial: RiskDetail;
    platform: RiskDetail;
    competition: RiskDetail;
  };
  roadmap: RoadmapPhase[];
  successCase: CaseStudy;
  failureCase: CaseStudy;
  createdAt: string;
}

/**
 * LLM response structure (from prompt)
 */
export interface LLMRecommendationResponse {
  /** AI生成的用户情况摘要 */
  user_summary: string;
  /** AI推荐该项目的理由 */
  recommendation_reason: string;
  title: string;
  summary: string;
  description: string;
  revenue: {
    monthly_min: number;
    monthly_max: number;
    breakeven_months: number;
  };
  startup_cost: {
    min: number;
    max: number;
  };
  work_content: string[];
  success_factors: string[];
  risk_assessment: {
    legal: {
      level: string;
      description: string;
      mitigation: string[];
    };
    financial: {
      level: string;
      description: string;
      mitigation: string[];
    };
    platform: {
      level: string;
      description: string;
      mitigation: string[];
    };
    competition: {
      level: string;
      description: string;
      mitigation: string[];
    };
  };
  roadmap: {
    phase: string;
    duration_days: number;
    tasks: string[];
  }[];
  success_case: {
    title: string;
    background: string;
    actions: string[];
    results: string;
    lessons: string[];
  };
  failure_case: {
    title: string;
    background: string;
    mistakes: string[];
    lessons: string[];
  };
}
