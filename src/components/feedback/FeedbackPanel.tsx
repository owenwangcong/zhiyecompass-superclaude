'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  hasFeedbackSubmitted,
  getFeedback,
  submitFeedback,
  POSITIVE_REASONS,
  NEGATIVE_REASONS,
  type FeedbackData,
} from '@/lib/utils/feedback';

interface FeedbackPanelProps {
  recommendationId: string;
  recommendationTitle?: string;
}

type FeedbackStep = 'initial' | 'rating' | 'reasons' | 'submitted';

export function FeedbackPanel({ recommendationId, recommendationTitle: _recommendationTitle }: FeedbackPanelProps) {
  const [step, setStep] = useState<FeedbackStep>('initial');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    if (hasFeedbackSubmitted(recommendationId)) {
      setExistingFeedback(getFeedback(recommendationId));
      setStep('submitted');
    }
  }, [recommendationId]);

  const handleQuickFeedback = (isPositive: boolean) => {
    setRating(isPositive ? 4 : 2);
    setStep('reasons');
  };

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await submitFeedback({
        recommendationId,
        rating,
        reasons: selectedReasons,
        comment: comment.trim() || undefined,
      });
      setStep('submitted');
      setExistingFeedback({
        recommendationId,
        rating,
        reasons: selectedReasons,
        comment: comment.trim() || undefined,
        submittedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = rating >= 3 ? POSITIVE_REASONS : NEGATIVE_REASONS;

  // Already submitted state
  if (step === 'submitted') {
    return (
      <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <div className="text-center">
          <p className="text-green-700 dark:text-green-300 font-medium flex items-center justify-center gap-2">
            <span className="text-xl">✅</span>
            感谢您的反馈！
          </p>
          {existingFeedback && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= existingFeedback.rating ? 'text-yellow-500' : 'text-zinc-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Initial quick feedback buttons
  if (step === 'initial') {
    return (
      <Card className="p-4">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          这个推荐对您有帮助吗？
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleQuickFeedback(true)}
            className="min-w-[100px] min-h-[44px] active:scale-95 transition-transform"
          >
            👍 有用
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleQuickFeedback(false)}
            className="min-w-[100px] min-h-[44px] active:scale-95 transition-transform"
          >
            👎 没用
          </Button>
        </div>
        <button
          onClick={() => setStep('rating')}
          className="mt-3 w-full text-center text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          详细评价 →
        </button>
      </Card>
    );
  }

  // Detailed rating step
  if (step === 'rating') {
    return (
      <Card className="p-4">
        <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          请给这个推荐打分
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                setRating(star);
                setStep('reasons');
              }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`${star}星评价`}
            >
              {star <= (hoveredRating || rating) ? (
                <span className="text-yellow-500">★</span>
              ) : (
                <span className="text-zinc-300 dark:text-zinc-600">☆</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>不满意</span>
          <span>非常满意</span>
        </div>
        <button
          onClick={() => setStep('initial')}
          className="mt-3 w-full text-center text-xs text-zinc-400 hover:text-zinc-600"
        >
          ← 返回
        </button>
      </Card>
    );
  }

  // Reasons selection step
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {rating >= 3 ? '哪些方面做得好？' : '哪些方面需要改进？'}
        </p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                setRating(star);
                setSelectedReasons([]);
              }}
              className="text-lg min-w-[28px] min-h-[28px]"
              aria-label={`改为${star}星`}
            >
              {star <= rating ? (
                <span className="text-yellow-500">★</span>
              ) : (
                <span className="text-zinc-300">☆</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {reasons.map((reason) => (
          <button
            key={reason.id}
            onClick={() => handleReasonToggle(reason.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors min-h-[36px] ${
              selectedReasons.includes(reason.id)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
            }`}
          >
            {reason.label}
          </button>
        ))}
      </div>

      <Textarea
        placeholder="还有其他建议吗？（选填）"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-4 min-h-[80px] text-base"
        maxLength={500}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('initial')}
          className="flex-1 min-h-[44px]"
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 min-h-[44px]"
        >
          {isSubmitting ? '提交中...' : '提交反馈'}
        </Button>
      </div>
    </Card>
  );
}
