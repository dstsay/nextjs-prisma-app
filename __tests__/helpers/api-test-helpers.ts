import { NextRequest } from 'next/server';
import { hashToken } from '@/lib/csrf';

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
    includeCSRF?: boolean;
  } = {}
): NextRequest {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    searchParams = {},
    includeCSRF = false 
  } = options;

  // Build URL with search params
  const fullUrl = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    fullUrl.searchParams.set(key, value);
  });

  // Add CSRF token if needed
  const finalHeaders: Record<string, string> = { ...headers };
  if (includeCSRF && method !== 'GET') {
    const token = 'test-csrf-token';
    const hashedToken = hashToken(token);
    
    // Mock the cookies
    (global as any).mockCookies = {
      'csrf-token': hashedToken
    };
    
    finalHeaders['X-CSRF-Token'] = token;
  }

  if (body) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  // Create request with proper headers
  const request = new NextRequest(fullUrl, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  return request;
}

// Mock cookies function for CSRF validation
export function mockCookiesFunction(cookies: Record<string, string> = {}) {
  const cookieStore = {
    get: (name: string) => {
      const value = cookies[name] || (global as any).mockCookies?.[name];
      return value ? { value } : undefined;
    },
    set: jest.fn(),
    delete: jest.fn(),
  };

  return jest.fn().mockResolvedValue(cookieStore);
}