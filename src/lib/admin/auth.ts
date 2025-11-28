/**
 * Admin authentication utilities
 * Simple session-based auth with environment variable credentials
 */

import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'zhiyecompass_admin_session';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours

// Simple session token generation
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}


export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Validate admin credentials against environment variables
 */
export function validateCredentials(credentials: AdminCredentials): AuthResult {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Check if admin password is configured
  if (!adminPassword) {
    console.error('[Admin Auth] ADMIN_PASSWORD environment variable not set');
    return {
      success: false,
      message: '管理员账号未配置，请联系管理员',
    };
  }

  // Validate username
  if (credentials.username !== adminUsername) {
    return {
      success: false,
      message: '用户名或密码错误',
    };
  }

  // Validate password
  if (credentials.password !== adminPassword) {
    return {
      success: false,
      message: '用户名或密码错误',
    };
  }

  // Generate session token
  const token = generateSessionToken();

  return {
    success: true,
    message: '登录成功',
    token,
  };
}

/**
 * Set admin session cookie
 */
export async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get admin session from cookie
 */
export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  return session?.value || null;
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Check if user is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}

/**
 * Admin session store (in-memory for MVP)
 * In production, use Redis or database
 */
const activeSessions = new Map<string, { createdAt: number }>();

export function registerSession(token: string): void {
  activeSessions.set(token, { createdAt: Date.now() });

  // Clean up old sessions (older than 24h)
  const now = Date.now();
  for (const [key, value] of activeSessions.entries()) {
    if (now - value.createdAt > SESSION_MAX_AGE * 1000) {
      activeSessions.delete(key);
    }
  }
}

export function isValidSession(token: string): boolean {
  const session = activeSessions.get(token);
  if (!session) return false;

  const now = Date.now();
  if (now - session.createdAt > SESSION_MAX_AGE * 1000) {
    activeSessions.delete(token);
    return false;
  }

  return true;
}

export function invalidateSession(token: string): void {
  activeSessions.delete(token);
}
