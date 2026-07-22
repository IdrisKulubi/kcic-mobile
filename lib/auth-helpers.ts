import * as SecureStore from 'expo-secure-store';

import { authClient, AUTH_STORAGE_PREFIX } from '@/lib/auth-client';
import { clearLastAuthenticatedRoute } from '@/lib/session-cache';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  role?: string | null;
  organization?: string | null;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StoredAuth = {
  token: string;
  user?: AuthUser;
  source: 'better-auth-session-data' | 'better-auth-cookie' | 'custom-session' | 'legacy-token';
};

export const CUSTOM_SESSION_KEY = `${AUTH_STORAGE_PREFIX}_session`;
export const CUSTOM_SESSION_TOKEN_KEY = `${AUTH_STORAGE_PREFIX}_session_token`;

const CHUNK_MARKER = String.fromCharCode(1) + 'ba-chunks:';

const POSSIBLE_SESSION_DATA_KEYS = [
  `${AUTH_STORAGE_PREFIX}_session_data`,
  `${AUTH_STORAGE_PREFIX}.session_data`,
  `${AUTH_STORAGE_PREFIX}-session_data`,
];

const POSSIBLE_COOKIE_KEYS = [
  `${AUTH_STORAGE_PREFIX}_cookie`,
  `${AUTH_STORAGE_PREFIX}.cookie`,
  `${AUTH_STORAGE_PREFIX}-cookie`,
];

function normalizeToken(token: string | null | undefined) {
  const trimmed = token?.trim();
  if (!trimmed) return null;

  try {
    return decodeURIComponent(trimmed).split('.')[0];
  } catch {
    return trimmed.split('.')[0];
  }
}

function tokenFromCookie(cookie: string | null) {
  if (!cookie) return null;

  try {
    const parsed = JSON.parse(cookie) as Record<
      string,
      { value?: unknown; expires?: unknown } | string
    >;

    for (const [name, entry] of Object.entries(parsed)) {
      if (!name.endsWith('session_token')) continue;

      const value = typeof entry === 'string' ? entry : entry?.value;
      const expires = typeof entry === 'string' ? null : entry?.expires;

      if (
        typeof expires === 'string' &&
        Number.isFinite(new Date(expires).getTime()) &&
        new Date(expires).getTime() <= Date.now()
      ) {
        continue;
      }

      if (typeof value === 'string') {
        return normalizeToken(value);
      }
    }
  } catch {
    // A cookie header is handled below.
  }

  const match = cookie.match(/(?:^|;\s*)[^=;]*session_token=([^;]+)/);
  return normalizeToken(match?.[1]);
}

async function readSecureStoreValue(key: string) {
  const stored = await SecureStore.getItemAsync(key);
  if (!stored?.startsWith(CHUNK_MARKER)) return stored;

  const count = Number(stored.slice(CHUNK_MARKER.length));
  if (!Number.isInteger(count) || count < 1) return null;

  const chunks = await Promise.all(
    Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`))
  );

  if (chunks.some((chunk) => chunk == null)) return null;
  return chunks.join('');
}

async function deleteSecureStoreValue(key: string) {
  const stored = await SecureStore.getItemAsync(key).catch(() => null);

  if (stored?.startsWith(CHUNK_MARKER)) {
    const count = Number(stored.slice(CHUNK_MARKER.length));
    if (Number.isInteger(count) && count > 0) {
      await Promise.all(
        Array.from({ length: count }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.${index}`).catch(() => undefined)
        )
      );
    }
  }

  await SecureStore.deleteItemAsync(key).catch(() => undefined);
}

async function getFirstValue(keys: string[]) {
  for (const key of keys) {
    const value = await readSecureStoreValue(key);
    if (value) return value;
  }

  return null;
}

export async function saveCustomSession(input: { token: string; user: AuthUser; expiresAt?: string }) {
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();

  await SecureStore.setItemAsync(
    CUSTOM_SESSION_KEY,
    JSON.stringify({
      session: {
        token: input.token,
        userId: input.user.id,
        expiresAt,
      },
      user: input.user,
    })
  );
  await SecureStore.setItemAsync(CUSTOM_SESSION_TOKEN_KEY, input.token);
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  const sessionData = await getFirstValue(POSSIBLE_SESSION_DATA_KEYS);
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      const token = normalizeToken(parsed?.session?.token ?? parsed?.token);
      if (token) {
        return {
          token,
          user: parsed.user,
          source: 'better-auth-session-data',
        };
      }
    } catch {
      // Fall through to cookie/token lookup.
    }
  }

  const getCookie = (authClient as typeof authClient & { getCookie?: () => string }).getCookie;
  const cookie = getCookie?.() || (await getFirstValue(POSSIBLE_COOKIE_KEYS));
  const cookieToken = tokenFromCookie(cookie);

  if (cookieToken) {
    return {
      token: cookieToken,
      source: 'better-auth-cookie',
    };
  }

  const customSession = await readSecureStoreValue(CUSTOM_SESSION_KEY);
  if (customSession) {
    try {
      const parsed = JSON.parse(customSession);
      const token = normalizeToken(parsed?.session?.token ?? parsed?.token);
      if (token) {
        return {
          token,
          user: parsed.user,
          source: 'custom-session',
        };
      }
    } catch {
      // Fall through to legacy token.
    }
  }

  const legacyToken = normalizeToken(await readSecureStoreValue(CUSTOM_SESSION_TOKEN_KEY));
  if (legacyToken) {
    return {
      token: legacyToken,
      source: 'legacy-token',
    };
  }

  return null;
}

export async function getAuthToken() {
  return (await getStoredAuth())?.token ?? null;
}

export async function clearSession() {
  try {
    await authClient.signOut();
  } catch {
    // Local cleanup still runs if backend sign-out is unreachable.
  }

  const keys = [
    ...POSSIBLE_SESSION_DATA_KEYS,
    ...POSSIBLE_COOKIE_KEYS,
    CUSTOM_SESSION_KEY,
    CUSTOM_SESSION_TOKEN_KEY,
  ];

  await Promise.all(keys.map(deleteSecureStoreValue));
  await clearLastAuthenticatedRoute();
}
