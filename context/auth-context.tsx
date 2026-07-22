import { useRouter, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { apiFetch } from '@/lib/api-client';
import { AuthUser, clearSession, getStoredAuth, saveCustomSession } from '@/lib/auth-helpers';
import { getLastAuthenticatedRoute, setLastAuthenticatedRoute } from '@/lib/session-cache';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  signInPrototype: () => Promise<void>;
  setAuthenticatedSession: (input: { token: string; user: AuthUser }) => Promise<void>;
};

const DEMO_USER: AuthUser = {
  id: 'prototype-user-idris',
  name: 'Idris Kulubi',
  email: 'idris@kcic.co.ke',
  emailVerified: true,
  image: null,
  role: 'Climate Innovation Member',
  organization: 'Kenya Climate Innovation Center',
  location: 'Nairobi, Kenya',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isProtectedSegment(segment?: string) {
  return (
    segment === '(tabs)' ||
    segment === 'search' ||
    segment === 'notifications' ||
    segment === 'ask' ||
    segment === 'content' ||
    segment === 'settings'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const stored = await getStoredAuth();
    if (!stored) {
      setToken(null);
      setUser(null);
      setStatus('unauthenticated');
      return;
    }

    setToken(stored.token);
    setUser(stored.user ?? null);
    setStatus('authenticated');

    try {
      const profile = await apiFetch<{ user: AuthUser }>('/api/user/me');
      if (profile.user) {
        setUser(profile.user);
      }
    } catch {
      // Network failures keep the local session; explicit invalid-session responses clear it in apiFetch.
      if (!(await getStoredAuth())) {
        setToken(null);
        setUser(null);
        setStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (status === 'loading') return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const protectedRoute = isProtectedSegment(firstSegment);

    if (status === 'unauthenticated' && protectedRoute) {
      router.replace('/(auth)' as never);
      return;
    }

    if (status === 'authenticated' && inAuthGroup) {
      getLastAuthenticatedRoute().then((route) => {
        router.replace((route as never) || '/(tabs)');
      });
    }
  }, [router, segments, status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const firstSegment = segments[0] as string | undefined;
    if (isProtectedSegment(firstSegment)) {
      setLastAuthenticatedRoute(`/${segments.join('/')}`).catch(() => undefined);
    }
  }, [segments, status]);

  const setAuthenticatedSession = useCallback(async (input: { token: string; user: AuthUser }) => {
    await saveCustomSession(input);
    setToken(input.token);
    setUser(input.user);
    setStatus('authenticated');
    router.replace('/(tabs)');
  }, [router]);

  const signInPrototype = useCallback(async () => {
    await setAuthenticatedSession({
      token: 'prototype-local-session-token',
      user: DEMO_USER,
    });
  }, [setAuthenticatedSession]);

  const signOut = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
    router.replace('/(auth)' as never);
  }, [router]);

  const value = useMemo(
    () => ({
      status,
      user,
      token,
      refreshSession,
      signOut,
      signInPrototype,
      setAuthenticatedSession,
    }),
    [refreshSession, setAuthenticatedSession, signInPrototype, signOut, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

