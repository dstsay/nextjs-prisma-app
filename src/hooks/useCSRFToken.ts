'use client';

import { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string>('');

  useEffect(() => {
    async function fetchCSRFToken() {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCSRFToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    }

    fetchCSRFToken();
  }, []);

  return csrfToken;
}

export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token
    };
  }
  
  return headers;
}