import { NextRequest, NextResponse } from 'next/server';
import { saveFeedback } from '@/lib/aws/dynamodb';

interface FeedbackPayload {
  recommendationId: string;
  rating: number;
  reasons: string[];
  comment?: string;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    // Validate required fields
    if (!body.recommendationId || typeof body.rating !== 'number') {
      return NextResponse.json(
        { success: false, message: '缺少必要字段' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, message: '评分必须在1-5之间' },
        { status: 400 }
      );
    }

    console.log('[Feedback Received]', {
      recommendationId: body.recommendationId,
      rating: body.rating,
      reasons: body.reasons,
      hasComment: !!body.comment,
      submittedAt: body.submittedAt,
    });

    // Save to DynamoDB
    const feedbackId = await saveFeedback({
      recommendationId: body.recommendationId,
      rating: body.rating,
      reasons: body.reasons,
      comment: body.comment,
      submittedAt: body.submittedAt,
    });

    console.log('[Feedback Saved]', feedbackId);

    return NextResponse.json({
      success: true,
      message: '反馈提交成功',
      feedbackId,
    });
  } catch (error) {
    console.error('[Feedback API Error]', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
