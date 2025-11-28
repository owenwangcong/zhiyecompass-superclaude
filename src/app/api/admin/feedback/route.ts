import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, isValidSession } from '@/lib/admin/auth';
import { getFeedbackList } from '@/lib/aws/dynamodb';

async function checkAuth(): Promise<boolean> {
  const token = await getAdminSession();
  return !!token && isValidSession(token);
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortBy = (searchParams.get('sortBy') || 'submittedAt') as 'submittedAt' | 'rating';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch real feedback from DynamoDB
    const { feedback, total, ratingDistribution } = await getFeedbackList({
      page,
      pageSize,
      sortBy,
      sortOrder,
    });

    // Calculate average rating
    const totalRating = Object.entries(ratingDistribution).reduce(
      (sum, [rating, count]) => sum + parseInt(rating) * count,
      0
    );
    const averageRating = total > 0 ? Math.round((totalRating / total) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      feedback,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: {
        totalFeedback: total,
        averageRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('[Admin Feedback Error]', error);
    return NextResponse.json(
      { success: false, message: '获取反馈数据失败' },
      { status: 500 }
    );
  }
}
