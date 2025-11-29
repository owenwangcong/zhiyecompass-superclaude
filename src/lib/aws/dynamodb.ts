/**
 * DynamoDB client utilities for Admin dashboard
 *
 * Table Schema (Single Table Design):
 * - PK: CONFIG#SYSTEM, SK: SETTINGS - System configuration
 * - PK: QUOTA#YYYY-MM-DDTHH, SK: COUNT - Hourly quota counter
 * - PK: USER#uuid, SK: PROFILE - User profile and recommendation list
 * - PK: REC#recommendationId, SK: METADATA - Recommendation metadata
 * - PK: FEEDBACK#feedbackId, SK: DATA - User feedback data
 * - PK: STATS#YYYY-MM-DD, SK: DAILY - Daily statistics
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { SystemConfig } from '@/lib/types';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ca-central-1',
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'zhiyecompass-main';

// ============================================
// System Configuration
// ============================================

export interface DynamoDBSystemConfig {
  hourlyLimit: number;
  llmModel: 'claude' | 'gpt-4' | 'deepseek-chat' | 'deepseek-reasoner';
  llmProvider: string;
  updatedAt: string;
}

/**
 * Get system configuration from DynamoDB
 */
export async function getSystemConfig(): Promise<DynamoDBSystemConfig> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: 'CONFIG#SYSTEM',
          SK: 'SETTINGS',
        },
      })
    );

    if (result.Item) {
      return {
        hourlyLimit: result.Item.hourly_limit || 10,
        llmModel: result.Item.llm_model || 'gpt-4',
        llmProvider: result.Item.llm_provider || 'openai',
        updatedAt: result.Item.updated_at || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('[DynamoDB] Error fetching system config:', error);
  }

  // Return defaults if config not found
  return {
    hourlyLimit: 10,
    llmModel: 'gpt-4',
    llmProvider: 'openai',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update system configuration in DynamoDB
 */
export async function updateSystemConfig(
  config: Partial<SystemConfig>
): Promise<DynamoDBSystemConfig> {
  const timestamp = new Date().toISOString();

  const updateExpressions: string[] = ['updated_at = :timestamp'];
  const expressionValues: Record<string, unknown> = { ':timestamp': timestamp };

  if (config.hourlyLimit !== undefined) {
    updateExpressions.push('hourly_limit = :hourlyLimit');
    expressionValues[':hourlyLimit'] = config.hourlyLimit;
  }

  if (config.llmModel !== undefined) {
    updateExpressions.push('llm_model = :llmModel');
    expressionValues[':llmModel'] = config.llmModel;
    // Also update provider based on model
    const provider =
      config.llmModel === 'claude'
        ? 'anthropic'
        : config.llmModel?.startsWith('deepseek')
          ? 'deepseek'
          : 'openai';
    updateExpressions.push('llm_provider = :llmProvider');
    expressionValues[':llmProvider'] = provider;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: 'CONFIG#SYSTEM',
        SK: 'SETTINGS',
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionValues,
    })
  );

  return getSystemConfig();
}

// ============================================
// Quota Management
// ============================================

export interface QuotaInfo {
  currentHourCount: number;
  currentHourLimit: number;
  currentHourKey: string;
  nextResetTime: string;
}

/**
 * Get current hour timestamp for quota tracking
 */
function getCurrentHourTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 13);
}

/**
 * Get current hour quota status
 */
export async function getCurrentQuotaStatus(
  hourlyLimit: number
): Promise<QuotaInfo> {
  const hourTimestamp = getCurrentHourTimestamp();
  const quotaKey = `QUOTA#${hourTimestamp}`;

  // Calculate next reset time
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: quotaKey,
          SK: 'COUNT',
        },
      })
    );

    return {
      currentHourCount: result.Item?.count || 0,
      currentHourLimit: hourlyLimit,
      currentHourKey: hourTimestamp,
      nextResetTime: nextHour.toISOString(),
    };
  } catch (error) {
    console.error('[DynamoDB] Error fetching quota status:', error);
    return {
      currentHourCount: 0,
      currentHourLimit: hourlyLimit,
      currentHourKey: hourTimestamp,
      nextResetTime: nextHour.toISOString(),
    };
  }
}

// ============================================
// Statistics
// ============================================

export interface DailyStats {
  date: string;
  count: number;
}

export interface RecentActivity {
  type: 'recommendation' | 'feedback' | 'share';
  timestamp: string;
  details: string;
}

export interface AdminStats {
  totalRecommendations: number;
  todayRecommendations: number;
  currentHourCount: number;
  currentHourLimit: number;
  currentHourKey: string;
  totalShares: number;
  averageFeedbackRating: number;
  feedbackCount: number;
  recentActivity: RecentActivity[];
  dailyStats: DailyStats[];
}

/**
 * Get total recommendation count by scanning REC# items
 */
async function getTotalRecommendationCount(): Promise<number> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': 'REC#',
          ':sk': 'METADATA',
        },
        Select: 'COUNT',
      })
    );
    return result.Count || 0;
  } catch (error) {
    console.error('[DynamoDB] Error counting recommendations:', error);
    return 0;
  }
}

/**
 * Get today's recommendation count
 */
async function getTodayRecommendationCount(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression:
          'begins_with(PK, :pk) AND SK = :sk AND begins_with(created_at, :today)',
        ExpressionAttributeValues: {
          ':pk': 'REC#',
          ':sk': 'METADATA',
          ':today': today,
        },
        Select: 'COUNT',
      })
    );
    return result.Count || 0;
  } catch (error) {
    console.error('[DynamoDB] Error counting today recommendations:', error);
    return 0;
  }
}

/**
 * Get feedback statistics
 */
async function getFeedbackStats(): Promise<{
  count: number;
  averageRating: number;
}> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': 'FEEDBACK#',
          ':sk': 'DATA',
        },
        ProjectionExpression: 'rating',
      })
    );

    const items = result.Items || [];
    const count = items.length;
    const totalRating = items.reduce(
      (sum: number, item: Record<string, unknown>) => sum + ((item.rating as number) || 0),
      0
    );
    const averageRating = count > 0 ? totalRating / count : 0;

    return {
      count,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  } catch (error) {
    console.error('[DynamoDB] Error fetching feedback stats:', error);
    return { count: 0, averageRating: 0 };
  }
}

/**
 * Get share count from recommendations
 */
async function getShareCount(): Promise<number> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression:
          'begins_with(PK, :pk) AND SK = :sk AND share_count > :zero',
        ExpressionAttributeValues: {
          ':pk': 'REC#',
          ':sk': 'METADATA',
          ':zero': 0,
        },
        ProjectionExpression: 'share_count',
      })
    );

    const items = result.Items || [];
    return items.reduce((sum: number, item: Record<string, unknown>) => sum + ((item.share_count as number) || 0), 0);
  } catch (error) {
    console.error('[DynamoDB] Error counting shares:', error);
    return 0;
  }
}

/**
 * Get recent activity (last 10 items)
 */
async function getRecentActivity(): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  try {
    // Get recent recommendations
    const recResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': 'REC#',
          ':sk': 'METADATA',
        },
        ProjectionExpression: 'PK, created_at, user_uuid',
        Limit: 20,
      })
    );

    for (const item of recResult.Items || []) {
      activities.push({
        type: 'recommendation',
        timestamp: item.created_at || new Date().toISOString(),
        details: `用户ID: ${(item.user_uuid as string)?.slice(0, 8) || 'unknown'}...`,
      });
    }

    // Get recent feedback
    const feedbackResult = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': 'FEEDBACK#',
          ':sk': 'DATA',
        },
        ProjectionExpression: 'submitted_at, rating',
        Limit: 10,
      })
    );

    for (const item of feedbackResult.Items || []) {
      activities.push({
        type: 'feedback',
        timestamp: item.submitted_at || new Date().toISOString(),
        details: `评分: ${item.rating || 0}星`,
      });
    }

    // Sort by timestamp descending and limit to 10
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return activities.slice(0, 10);
  } catch (error) {
    console.error('[DynamoDB] Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Get daily stats for the last 7 days
 */
async function getDailyStats(): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;

    try {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression:
            'begins_with(PK, :pk) AND SK = :sk AND begins_with(created_at, :date)',
          ExpressionAttributeValues: {
            ':pk': 'REC#',
            ':sk': 'METADATA',
            ':date': dateStr,
          },
          Select: 'COUNT',
        })
      );

      stats.push({
        date: displayDate,
        count: result.Count || 0,
      });
    } catch (error) {
      console.error(`[DynamoDB] Error fetching stats for ${dateStr}:`, error);
      stats.push({ date: displayDate, count: 0 });
    }
  }

  return stats;
}

/**
 * Get all admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  // Get system config first for hourly limit
  const config = await getSystemConfig();
  const quotaStatus = await getCurrentQuotaStatus(config.hourlyLimit);

  // Fetch all stats in parallel
  const [
    totalRecommendations,
    todayRecommendations,
    feedbackStats,
    totalShares,
    recentActivity,
    dailyStats,
  ] = await Promise.all([
    getTotalRecommendationCount(),
    getTodayRecommendationCount(),
    getFeedbackStats(),
    getShareCount(),
    getRecentActivity(),
    getDailyStats(),
  ]);

  return {
    totalRecommendations,
    todayRecommendations,
    currentHourCount: quotaStatus.currentHourCount,
    currentHourLimit: quotaStatus.currentHourLimit,
    currentHourKey: quotaStatus.currentHourKey,
    totalShares,
    averageFeedbackRating: feedbackStats.averageRating,
    feedbackCount: feedbackStats.count,
    recentActivity,
    dailyStats,
  };
}

// ============================================
// Feedback Management
// ============================================

export interface FeedbackRecord {
  id: string;
  recommendationId: string;
  recommendationTitle?: string;
  rating: number;
  reasons: string[];
  comment?: string;
  submittedAt: string;
}

/**
 * Save feedback to DynamoDB
 */
export async function saveFeedback(feedback: {
  recommendationId: string;
  rating: number;
  reasons: string[];
  comment?: string;
  submittedAt: string;
}): Promise<string> {
  const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Get recommendation title if available
  let recommendationTitle = '';
  try {
    const recResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `REC#${feedback.recommendationId}`,
          SK: 'METADATA',
        },
        ProjectionExpression: 'title',
      })
    );
    recommendationTitle = (recResult.Item?.title as string) || '';
  } catch (error) {
    console.error('[DynamoDB] Error fetching recommendation title:', error);
  }

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `FEEDBACK#${feedbackId}`,
        SK: 'DATA',
        recommendation_id: feedback.recommendationId,
        recommendation_title: recommendationTitle,
        rating: feedback.rating,
        reasons: feedback.reasons,
        comment: feedback.comment || '',
        submitted_at: feedback.submittedAt,
      },
    })
  );

  return feedbackId;
}

/**
 * Get feedback list with pagination
 */
export async function getFeedbackList(options: {
  page?: number;
  pageSize?: number;
  sortBy?: 'submittedAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  feedback: FeedbackRecord[];
  total: number;
  ratingDistribution: Record<number, number>;
}> {
  const { page = 1, pageSize = 10, sortBy = 'submittedAt', sortOrder = 'desc' } = options;

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pk': 'FEEDBACK#',
          ':sk': 'DATA',
        },
      })
    );

    const items = result.Items || [];

    // Transform to FeedbackRecord
    let feedback: FeedbackRecord[] = items.map((item: Record<string, unknown>) => ({
      id: (item.PK as string).replace('FEEDBACK#', ''),
      recommendationId: (item.recommendation_id as string) || '',
      recommendationTitle: (item.recommendation_title as string) || '',
      rating: (item.rating as number) || 0,
      reasons: (item.reasons as string[]) || [],
      comment: (item.comment as string) || '',
      submittedAt: (item.submitted_at as string) || '',
    }));

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    feedback.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        ratingDistribution[f.rating]++;
      }
    });

    // Sort
    feedback.sort((a, b) => {
      const aVal =
        sortBy === 'rating'
          ? a.rating
          : new Date(a.submittedAt).getTime();
      const bVal =
        sortBy === 'rating'
          ? b.rating
          : new Date(b.submittedAt).getTime();
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Paginate
    const total = feedback.length;
    const startIndex = (page - 1) * pageSize;
    feedback = feedback.slice(startIndex, startIndex + pageSize);

    return { feedback, total, ratingDistribution };
  } catch (error) {
    console.error('[DynamoDB] Error fetching feedback list:', error);
    return {
      feedback: [],
      total: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// ============================================
// Share Tracking
// ============================================

/**
 * Increment share count for a recommendation
 */
export async function incrementShareCount(
  recommendationId: string
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `REC#${recommendationId}`,
          SK: 'METADATA',
        },
        UpdateExpression:
          'SET share_count = if_not_exists(share_count, :zero) + :one',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':one': 1,
        },
      })
    );
  } catch (error) {
    console.error('[DynamoDB] Error incrementing share count:', error);
  }
}
