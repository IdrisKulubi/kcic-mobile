import type { ToastInput } from '@/lib/toast';

export type AuthAction = 'sign-in' | 'sign-up' | 'password-reset' | 'google' | 'apple';

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
    const value = error as {
      message?: unknown;
      code?: unknown;
      status?: unknown;
      statusText?: unknown;
    };

    const message =
      typeof value.message === 'string'
        ? value.message
        : typeof value.statusText === 'string' && value.statusText.trim()
          ? value.statusText
          : typeof value.code === 'string'
            ? value.code.replace(/_/g, ' ').toLowerCase()
            : 'Authentication could not be completed.';

    throw new AuthRequestError(
      message,
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
    normalized.includes('invalid_otp') ||
    normalized.includes('invalid otp') ||
    normalized.includes('otp_expired') ||
    normalized.includes('otp expired')
  ) {
    return {
      tone: 'error',
      title: 'Invalid or expired code',
      message: 'Check the code or request a new one, then try again.',
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

  if (
    normalized.includes('failed to send email') ||
    normalized.includes('verification email') ||
    normalized.includes('send email')
  ) {
    if (action === 'password-reset') {
      return {
        tone: 'error',
        title: 'Could not send reset code',
        message: 'Please wait a moment and try again.',
        duration: 6000,
      };
    }

    return {
      tone: 'warning',
      title: 'Account created',
      message: 'We could not send the verification email yet. Use "I didn\'t get a code" to resend.',
      duration: 6000,
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
    'password-reset': 'Could not reset password',
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
