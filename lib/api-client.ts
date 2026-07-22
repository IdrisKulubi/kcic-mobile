import { API_BASE_URL } from '@/lib/auth-client';
import { clearSession, getAuthToken } from '@/lib/auth-helpers';

export class ApiAuthError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiAuthError';
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);

  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }

  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const code =
      typeof payload === 'object' && payload && 'code' in payload
        ? String((payload as { code?: unknown }).code)
        : undefined;

    if (code === 'UNAUTHENTICATED' || code === 'INVALID_TOKEN' || code === 'SESSION_EXPIRED') {
      await clearSession();
    }

    throw new ApiAuthError(`Request failed with ${response.status}`, code);
  }

  return payload as T;
}

