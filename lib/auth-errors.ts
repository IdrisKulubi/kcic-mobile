import type { ToastInput } from '@/lib/toast';

export type AuthAction = 'sign-in' | 'sign-up' | 'google' | 'apple';

export class AuthRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthRequestError';
    this.code = code;
  }
}

export function throwIfAuthError(result: unknown) {
  if (!result || typeof result !== 'object' || !('error' in result)) return;

  const error = (result as { error?: unknown }).error;
  if (!error) return;

  if (typeof error === 'string') {
    throw new AuthRequestError(error);
  }

  if (typeof error === 'object') {
    const value = error as { message?: unknown; code?: unknown };
    throw new AuthRequestError(
      typeof value.message === 'string' ? value.message : 'Authentication could not be completed.',
      typeof value.code === 'string' ? value.code : undefined
    );
  }

  throw new AuthRequestError('Authentication could not be completed.');
}

export function getAuthErrorToast(error: unknown, action: AuthAction): ToastInput {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const code =
    error instanceof AuthRequestError
      ? error.code?.toUpperCase() ?? ''
      : typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: unknown }).code ?? '').toUpperCase()
        : '';
  const normalized = `${code} ${message}`.toLowerCase();

  if (
    normalized.includes('user_already_exists') ||
    normalized.includes('already exists') ||
    normalized.includes('already registered')
  ) {
    return {
      tone: 'warning',
      title: 'Account already exists',
      message: 'Use another email address or sign in instead.',
      duration: 5500,
    };
  }

  if (
    normalized.includes('invalid_email_or_password') ||
    normalized.includes('invalid password') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('incorrect password')
  ) {
    return {
      tone: 'error',
      title: 'Could not sign in',
      message: 'Check your email and password, then try again.',
    };
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network request failed') ||
    normalized.includes('network error') ||
    normalized.includes('timeout')
  ) {
    return {
      tone: 'error',
      title: 'Connection problem',
      message: 'Check your internet connection and try again.',
    };
  }

  if (normalized.includes('session was not saved')) {
    return {
      tone: 'warning',
      title: 'Sign-in incomplete',
      message: 'Your account was verified, but this device could not save the session. Please try again.',
      duration: 5500,
    };
  }

  if (action === 'apple' && (normalized.includes('invalid token') || normalized.includes('identity token'))) {
    return {
      tone: 'error',
      title: 'Apple sign-in failed',
      message: 'Apple could not verify this sign-in. Please try again.',
    };
  }

  const titles: Record<AuthAction, string> = {
    'sign-in': 'Could not sign in',
    'sign-up': 'Could not create account',
    google: 'Google sign-in failed',
    apple: 'Apple sign-in failed',
  };

  return {
    tone: 'error',
    title: titles[action],
    message: message || 'Please try again in a moment.',
    duration: 5000,
  };
}
