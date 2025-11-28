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
 * Timeout set to 60 seconds to allow for LLM generation time
 */
export async function invokeRecommendationLambda(
  params: LambdaInvokeParams
): Promise<LambdaResponse> {
  const apiEndpoint = process.env.API_ENDPOINT;

  if (!apiEndpoint) {
    throw new Error('API_ENDPOINT environment variable is not configured');
  }

  // Support both API Gateway (/recommend path) and Lambda Function URL (direct)
  // Lambda Function URL ends with .lambda-url.region.on.aws
  const isLambdaFunctionUrl = apiEndpoint.includes('.lambda-url.');
  const url = isLambdaFunctionUrl ? apiEndpoint : `${apiEndpoint}/recommend`;

  // Create AbortController for timeout (120 seconds to match Lambda timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
    clearTimeout(timeoutId);
    console.error('Error invoking Lambda:', error);

    // Check if it's an abort/timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'AI生成超时，请稍后重试。如持续出现此问题，可能是服务繁忙。',
        error: 'Request timeout after 120 seconds',
      };
    }

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
