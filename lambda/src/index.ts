/**
 * ZhiYeCompass Recommendation Engine Lambda
 *
 * Main entry point for the recommendation Lambda function.
 * Handles:
 * - Hourly quota checking
 * - LLM-based project recommendation generation
 * - S3 storage of recommendations
 * - DynamoDB record management
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateRecommendation } from './llm';
import { UserProfile, ProjectRecommendation } from './types';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.REGION || 'ca-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.REGION || 'ca-central-1' });

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'zhiyecompass-main';
const S3_BUCKET = process.env.S3_BUCKET || 'zhiyecompass-recommendations';

/**
 * Get current hour timestamp for quota tracking
 * Format: YYYY-MM-DDTHH (e.g., 2024-01-15T10)
 */
function getCurrentHourTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 13);
}

/**
 * Get system configuration from DynamoDB
 */
async function getSystemConfig(): Promise<{ hourlyLimit: number; llmModel: string; llmProvider: string }> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        PK: 'CONFIG#SYSTEM',
        SK: 'SETTINGS'
      }
    }));

    if (result.Item) {
      return {
        hourlyLimit: result.Item.hourly_limit || 10,
        llmModel: result.Item.llm_model || 'gpt-4o',
        llmProvider: result.Item.llm_provider || 'openai'
      };
    }
  } catch (error) {
    console.error('Error fetching system config:', error);
  }

  // Return defaults if config not found
  return {
    hourlyLimit: 10,
    llmModel: 'gpt-4o',
    llmProvider: 'openai'
  };
}

/**
 * Check and update hourly quota
 * Returns: { allowed: boolean, currentCount: number, limit: number }
 */
async function checkAndUpdateQuota(hourlyLimit: number): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  nextResetTime: string;
}> {
  const hourTimestamp = getCurrentHourTimestamp();
  const quotaKey = `QUOTA#${hourTimestamp}`;

  // Calculate next reset time
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  const nextResetTime = nextHour.toISOString();

  try {
    // Get current quota count
    const result = await docClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        PK: quotaKey,
        SK: 'COUNT'
      }
    }));

    const currentCount = result.Item?.count || 0;

    if (currentCount >= hourlyLimit) {
      return {
        allowed: false,
        currentCount,
        limit: hourlyLimit,
        nextResetTime
      };
    }

    // Increment quota counter
    const ttl = Math.floor(Date.now() / 1000) + 7200; // 2 hours TTL

    await docClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: quotaKey,
        SK: 'COUNT',
        count: currentCount + 1,
        ttl
      }
    }));

    return {
      allowed: true,
      currentCount: currentCount + 1,
      limit: hourlyLimit,
      nextResetTime
    };
  } catch (error) {
    console.error('Error checking/updating quota:', error);
    // Allow on error to avoid blocking users
    return {
      allowed: true,
      currentCount: 0,
      limit: hourlyLimit,
      nextResetTime
    };
  }
}

/**
 * Save recommendation to S3
 */
async function saveRecommendationToS3(
  recommendation: ProjectRecommendation
): Promise<string> {
  const s3Key = `recommendations/${recommendation.id}.json`;

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: JSON.stringify(recommendation, null, 2),
    ContentType: 'application/json',
  }));

  return s3Key;
}

/**
 * Record recommendation metadata in DynamoDB
 */
async function recordRecommendation(
  recommendationId: string,
  userUuid: string,
  s3Key: string,
  profile: UserProfile
): Promise<void> {
  const timestamp = new Date().toISOString();

  // Record recommendation metadata
  await docClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      PK: `REC#${recommendationId}`,
      SK: 'METADATA',
      user_uuid: userUuid,
      s3_key: s3Key,
      created_at: timestamp,
      title: '', // Will be updated after generation
      summary: ''
    }
  }));

  // Update user's recommendation list
  try {
    // First try to update existing user record
    await docClient.send(new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        PK: `USER#${userUuid}`,
        SK: 'PROFILE'
      },
      UpdateExpression: 'SET recommendation_ids = list_append(if_not_exists(recommendation_ids, :empty), :newId), profile_data = :profile, updated_at = :timestamp',
      ExpressionAttributeValues: {
        ':newId': [recommendationId],
        ':empty': [],
        ':profile': profile,
        ':timestamp': timestamp
      }
    }));
  } catch (error) {
    // If user record doesn't exist, create it
    await docClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `USER#${userUuid}`,
        SK: 'PROFILE',
        recommendation_ids: [recommendationId],
        profile_data: profile,
        created_at: timestamp,
        updated_at: timestamp
      }
    }));
  }
}

/**
 * Update recommendation metadata after generation
 */
async function updateRecommendationMetadata(
  recommendationId: string,
  title: string,
  summary: string
): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      PK: `REC#${recommendationId}`,
      SK: 'METADATA'
    },
    UpdateExpression: 'SET title = :title, summary = :summary',
    ExpressionAttributeValues: {
      ':title': title,
      ':summary': summary
    }
  }));
}

/**
 * Create error response with CORS headers
 */
function createErrorResponse(statusCode: number, message: string, details?: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({
      success: false,
      message,
      ...details
    })
  };
}

/**
 * Create success response with CORS headers
 */
function createSuccessResponse(data: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      ...data
    })
  };
}

/**
 * Main Lambda handler
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse(400, '请求体不能为空');
    }

    const body = JSON.parse(event.body);
    const { uuid, profile, recommendationId } = body;

    // Validate required fields
    if (!uuid) {
      return createErrorResponse(400, '缺少用户标识');
    }

    if (!profile) {
      return createErrorResponse(400, '缺少用户画像数据');
    }

    if (!recommendationId) {
      return createErrorResponse(400, '缺少推荐ID');
    }

    // Get system config
    const config = await getSystemConfig();
    console.log('System config:', config);

    // Check hourly quota
    const quotaResult = await checkAndUpdateQuota(config.hourlyLimit);
    console.log('Quota check result:', quotaResult);

    if (!quotaResult.allowed) {
      return createErrorResponse(429, '本小时推荐额度已用完，请稍后再试', {
        currentCount: quotaResult.currentCount,
        limit: quotaResult.limit,
        nextResetTime: quotaResult.nextResetTime
      });
    }

    // Generate recommendation using LLM
    console.log('Generating recommendation with LLM...');
    const recommendation = await generateRecommendation(
      profile as UserProfile,
      recommendationId,
      uuid,
      config.llmModel,
      config.llmProvider
    );

    // Save to S3
    console.log('Saving recommendation to S3...');
    const s3Key = await saveRecommendationToS3(recommendation);

    // Record in DynamoDB
    console.log('Recording recommendation in DynamoDB...');
    await recordRecommendation(recommendationId, uuid, s3Key, profile as UserProfile);

    // Update metadata with title and summary
    await updateRecommendationMetadata(recommendationId, recommendation.title, recommendation.summary);

    console.log('Recommendation generated successfully:', recommendationId);

    return createSuccessResponse({
      recommendationId,
      title: recommendation.title,
      summary: recommendation.summary,
      quotaRemaining: quotaResult.limit - quotaResult.currentCount
    });

  } catch (error) {
    console.error('Lambda execution error:', error);

    if (error instanceof SyntaxError) {
      return createErrorResponse(400, '请求体JSON格式错误');
    }

    return createErrorResponse(500, '服务器内部错误，请稍后重试', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
