import { NextResponse } from 'next/server';
import {
  getAdminSession,
  clearAdminSession,
  invalidateSession,
} from '@/lib/admin/auth';

export async function POST() {
  try {
    // Get current session
    const token = await getAdminSession();

    // Invalidate session if exists
    if (token) {
      invalidateSession(token);
    }

    // Clear cookie
    await clearAdminSession();

    console.log('[Admin Auth] Logout successful');

    return NextResponse.json({
      success: true,
      message: '已退出登录',
    });
  } catch (error) {
    console.error('[Admin Auth Error]', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
