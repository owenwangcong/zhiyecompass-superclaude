/**
 * AWS Lambda invocation utilities
 *
 * This module provides functions to invoke the recommendation Lambda function
 * either via API Gateway endpoint or direct Lambda invocation.
 */

interface LambdaInvokeParams {
  uuid: string;
  profile: Record<string, unknown>;
  recommendationId: string;
}

interface LambdaResponse {
  success: boolean;
  recommendationId?: string;
  title?: string;
  summary?: string;
  quotaRemaining?: number;
  message?: string;
  currentCount?: number;
  limit?: number;
  nextResetTime?: string;
  error?: string;
}

/**
 * Invoke the recommendation Lambda via API Gateway
 */
export async function invokeRecommendationLambda(
  params: LambdaInvokeParams
): Promise<LambdaResponse> {
  const apiEndpoint = process.env.API_ENDPOINT;

  if (!apiEndpoint) {
    throw new Error('API_ENDPOINT environment variable is not configured');
  }

  const url = `${apiEndpoint}/recommend`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle quota exceeded error specially
      if (response.status === 429) {
        return {
          success: false,
          message: data.message || '本小时推荐额度已用完，请稍后再试',
          currentCount: data.currentCount,
          limit: data.limit,
          nextResetTime: data.nextResetTime,
        };
      }

      return {
        success: false,
        message: data.message || '推荐生成失败，请稍后重试',
        error: data.error,
      };
    }

    return {
      success: true,
      recommendationId: data.recommendationId,
      title: data.title,
      summary: data.summary,
      quotaRemaining: data.quotaRemaining,
    };
  } catch (error) {
    console.error('Error invoking Lambda:', error);
    return {
      success: false,
      message: '网络错误，请检查网络连接后重试',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recommendation from S3 via API
 */
export async function getRecommendationFromS3(
  recommendationId: string
): Promise<Record<string, unknown> | null> {
  const apiEndpoint = process.env.API_ENDPOINT;

  if (!apiEndpoint) {
    console.error('API_ENDPOINT not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${apiEndpoint}/recommendation/${recommendationId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to get recommendation:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return null;
  }
}
