/**
 * AWS S3 client utilities for fetching recommendations
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { ProjectRecommendation } from '@/lib/types';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ca-central-1',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'zhiyecompass-recommendations';

/**
 * Fetch recommendation from S3 by ID
 */
export async function getRecommendationById(
  recommendationId: string
): Promise<ProjectRecommendation | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `recommendations/${recommendationId}.json`,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      console.error('No body in S3 response');
      return null;
    }

    const bodyContents = await response.Body.transformToString();
    const data = JSON.parse(bodyContents);

    // Transform S3 data to match our ProjectRecommendation type
    return transformS3DataToRecommendation(data, recommendationId);
  } catch (error) {
    console.error('Error fetching recommendation from S3:', error);
    return null;
  }
}

/**
 * Transform S3 stored data to ProjectRecommendation format
 * The Lambda stores data with snake_case, we need camelCase
 */
function transformS3DataToRecommendation(
  data: Record<string, unknown>,
  recommendationId: string
): ProjectRecommendation {
  const recommendation = data.recommendation as Record<string, unknown> || data;

  return {
    id: recommendationId,
    userId: data.userId as string || data.user_id as string || '',
    userSummary: data.userSummary as string || data.user_summary as string || undefined,
    recommendationReason: data.recommendationReason as string || data.recommendation_reason as string || undefined,
    title: recommendation.title as string || '',
    summary: recommendation.summary as string || '',
    description: recommendation.description as string || '',
    revenue: {
      monthlyMin: (recommendation.revenue as Record<string, number>)?.monthly_min ||
                  (recommendation.revenue as Record<string, number>)?.monthlyMin || 0,
      monthlyMax: (recommendation.revenue as Record<string, number>)?.monthly_max ||
                  (recommendation.revenue as Record<string, number>)?.monthlyMax || 0,
      breakevenMonths: (recommendation.revenue as Record<string, number>)?.breakeven_months ||
                       (recommendation.revenue as Record<string, number>)?.breakevenMonths || 0,
    },
    startupCost: {
      min: (recommendation.startup_cost as Record<string, number>)?.min ||
           (recommendation.startupCost as Record<string, number>)?.min || 0,
      max: (recommendation.startup_cost as Record<string, number>)?.max ||
           (recommendation.startupCost as Record<string, number>)?.max || 0,
    },
    workContent: (recommendation.work_content as string[]) ||
                 (recommendation.workContent as string[]) || [],
    successFactors: (recommendation.success_factors as string[]) ||
                    (recommendation.successFactors as string[]) || [],
    riskAssessment: transformRiskAssessment(
      (recommendation.risk_assessment || recommendation.riskAssessment) as Record<string, unknown>
    ),
    roadmap: transformRoadmap(
      (recommendation.roadmap as Array<Record<string, unknown>>) || []
    ),
    successCase: transformCase(
      (recommendation.success_case || recommendation.successCase) as Record<string, unknown>,
      'success'
    ),
    failureCase: transformCase(
      (recommendation.failure_case || recommendation.failureCase) as Record<string, unknown>,
      'failure'
    ),
    createdAt: data.createdAt as string || data.created_at as string || new Date().toISOString(),
  };
}

function transformRiskAssessment(
  risk: Record<string, unknown> | undefined
): ProjectRecommendation['riskAssessment'] {
  if (!risk) {
    return {
      legal: { level: 'medium', description: '', mitigation: [] },
      financial: { level: 'medium', description: '', mitigation: [] },
      platform: { level: 'medium', description: '', mitigation: [] },
      competition: { level: 'medium', description: '', mitigation: [] },
    };
  }

  const transformRisk = (r: Record<string, unknown> | undefined) => ({
    level: (r?.level as string) || 'medium',
    description: (r?.description as string) || '',
    mitigation: (r?.mitigation as string[]) || [],
  });

  return {
    legal: transformRisk(risk.legal as Record<string, unknown>),
    financial: transformRisk(risk.financial as Record<string, unknown>),
    platform: transformRisk(risk.platform as Record<string, unknown>),
    competition: transformRisk(risk.competition as Record<string, unknown>),
  };
}

function transformRoadmap(
  roadmap: Array<Record<string, unknown>>
): ProjectRecommendation['roadmap'] {
  return roadmap.map((phase) => ({
    phase: (phase.phase as string) || '',
    durationDays: (phase.duration_days as number) || (phase.durationDays as number) || 0,
    tasks: (phase.tasks as string[]) || [],
  }));
}

function transformCase(
  caseData: Record<string, unknown> | undefined,
  type: 'success' | 'failure'
): ProjectRecommendation['successCase'] | ProjectRecommendation['failureCase'] {
  if (!caseData) {
    if (type === 'success') {
      return {
        title: '',
        background: '',
        actions: [],
        results: '',
        lessons: [],
      };
    } else {
      return {
        title: '',
        background: '',
        mistakes: [],
        lessons: [],
      };
    }
  }

  if (type === 'success') {
    return {
      title: (caseData.title as string) || '',
      background: (caseData.background as string) || '',
      actions: (caseData.actions as string[]) || [],
      results: (caseData.results as string) || '',
      lessons: (caseData.lessons as string[]) || [],
    };
  } else {
    return {
      title: (caseData.title as string) || '',
      background: (caseData.background as string) || '',
      mistakes: (caseData.mistakes as string[]) || [],
      lessons: (caseData.lessons as string[]) || [],
    };
  }
}
