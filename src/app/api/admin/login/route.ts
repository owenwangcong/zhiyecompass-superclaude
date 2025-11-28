import { NextRequest, NextResponse } from 'next/server';
import {
  validateCredentials,
  setAdminSession,
  registerSession,
} from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    // Validate credentials
    const result = validateCredentials({ username, password });

    if (!result.success) {
      // Log failed attempt
      console.log('[Admin Auth] Login failed:', { username, ip: request.headers.get('x-forwarded-for') });
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    // Register session and set cookie
    if (result.token) {
      registerSession(result.token);
      await setAdminSession(result.token);
    }

    console.log('[Admin Auth] Login successful:', { username });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[Admin Auth Error]', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
