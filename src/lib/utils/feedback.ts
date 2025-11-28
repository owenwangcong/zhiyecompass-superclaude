/**
 * Feedback utility functions for recommendation feedback tracking
 */

const FEEDBACK_STORAGE_KEY = 'zhiyecompass_feedback';

export interface FeedbackData {
  recommendationId: string;
  rating: number; // 1-5 stars
  reasons: string[];
  comment?: string;
  submittedAt: string;
}

interface FeedbackStorage {
  [recommendationId: string]: FeedbackData;
}

/**
 * Check if feedback has been submitted for a recommendation
 */
export function hasFeedbackSubmitted(recommendationId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!stored) return false;

    const feedbackMap: FeedbackStorage = JSON.parse(stored);
    return !!feedbackMap[recommendationId];
  } catch {
    return false;
  }
}

/**
 * Get feedback for a specific recommendation
 */
export function getFeedback(recommendationId: string): FeedbackData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!stored) return null;

    const feedbackMap: FeedbackStorage = JSON.parse(stored);
    return feedbackMap[recommendationId] || null;
  } catch {
    return null;
  }
}

/**
 * Save feedback to local storage (and optionally to API)
 */
export function saveFeedbackLocally(feedback: FeedbackData): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const feedbackMap: FeedbackStorage = stored ? JSON.parse(stored) : {};

    feedbackMap[feedback.recommendationId] = feedback;
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackMap));
  } catch (error) {
    console.error('Failed to save feedback locally:', error);
  }
}

/**
 * Submit feedback to API
 */
export async function submitFeedback(feedback: Omit<FeedbackData, 'submittedAt'>): Promise<{ success: boolean; message?: string }> {
  const feedbackWithTimestamp: FeedbackData = {
    ...feedback,
    submittedAt: new Date().toISOString(),
  };

  // Save locally first for resilience
  saveFeedbackLocally(feedbackWithTimestamp);

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackWithTimestamp),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || '提交失败' };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to submit feedback to API:', error);
    // Still return success since we saved locally
    return { success: true, message: '反馈已保存本地' };
  }
}

/**
 * Feedback reason options
 */
export const POSITIVE_REASONS = [
  { id: 'accurate', label: '推荐精准' },
  { id: 'detailed', label: '内容详细' },
  { id: 'risk_helpful', label: '风险提示有用' },
  { id: 'actionable', label: '行动路径清晰' },
  { id: 'cases_helpful', label: '案例有参考价值' },
] as const;

export const NEGATIVE_REASONS = [
  { id: 'not_fit', label: '不适合我' },
  { id: 'too_generic', label: '内容太泛' },
  { id: 'unrealistic', label: '收益预期不现实' },
  { id: 'missing_info', label: '信息不够详细' },
  { id: 'already_know', label: '已经知道这个项目' },
] as const;
