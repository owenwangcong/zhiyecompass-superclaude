import { NextResponse } from 'next/server';
import { getAdminSession, isValidSession } from '@/lib/admin/auth';
import { getAdminStats } from '@/lib/aws/dynamodb';

async function checkAuth(): Promise<boolean> {
  const token = await getAdminSession();
  return !!token && isValidSession(token);
}

export async function GET() {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }

    // Fetch real stats from DynamoDB
    const stats = await getAdminStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return NextResponse.json(
      { success: false, message: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
