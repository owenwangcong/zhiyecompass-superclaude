/**
 * Core type definitions for ZhiYeCompass
 */

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
  /** 用户拥有的其他资源 */
  otherResources?: OtherResources;
}

/** 用户可利用的其他资源 */
export interface OtherResources {
  /** 选中的资源类型 */
  resourceTypes: ResourceType[];
  /** 详细描述 */
  description: string;
}

/** 资源类型 */
export type ResourceType =
  | 'connections'      // 人脉资源
  | 'channels'         // 渠道资源
  | 'equipment'        // 设备/物品
  | 'property'         // 房产/场地
  | 'vehicles'         // 车辆
  | 'inventory'        // 库存/货源
  | 'intellectual'     // 知识产权/专利
  | 'other';           // 其他资源

export interface ProjectRecommendation {
  id: string;
  userId: string;
  /** AI生成的用户情况摘要 */
  userSummary?: string;
  /** AI推荐该项目的理由 */
  recommendationReason?: string;
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

export interface SystemConfig {
  hourlyLimit: number;
  llmModel: 'claude' | 'gpt-4' | 'deepseek';
  updatedAt: string;
}

export interface QuotaRecord {
  hourTimestamp: string;
  count: number;
  ttl: number;
}
