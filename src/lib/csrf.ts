import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
}

export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const hashedToken = hashToken(token);
  
  (await cookies()).set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return token;
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const hashedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!hashedToken) {
    return null;
  }
  
  return hashedToken;
}

export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }
  
  const token = request.headers.get(CSRF_HEADER_NAME);
  if (!token) {
    return false;
  }
  
  const cookieStore = await cookies();
  const storedHashedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!storedHashedToken) {
    return false;
  }
  
  const hashedToken = hashToken(token);
  return hashedToken === storedHashedToken;
}

export function createCSRFMiddleware() {
  return async function csrfMiddleware(request: NextRequest): Promise<Response | null> {
    const isValid = await validateCSRFToken(request);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return null;
  };
}