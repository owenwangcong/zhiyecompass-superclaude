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
}

export interface ProjectRecommendation {
  id: string;
  userId: string;
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
