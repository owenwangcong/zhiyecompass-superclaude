import { NextResponse } from 'next/server';
import { getAdminSession, isValidSession } from '@/lib/admin/auth';

export async function GET() {
  try {
    const token = await getAdminSession();

    if (!token || !isValidSession(token)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
    });
  } catch (error) {
    console.error('[Admin Auth Check Error]', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
