import { NextRequest, NextResponse } from 'next/server';

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

    // In production, this would save to DynamoDB or S3
    // For MVP, we'll just log and return success
    console.log('[Feedback Received]', {
      recommendationId: body.recommendationId,
      rating: body.rating,
      reasons: body.reasons,
      hasComment: !!body.comment,
      submittedAt: body.submittedAt,
    });

    // TODO: Save to DynamoDB in production
    // await saveFeedbackToDynamoDB(body);

    // TODO: Track in analytics
    // await trackFeedbackEvent(body);

    return NextResponse.json({
      success: true,
      message: '反馈提交成功',
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
