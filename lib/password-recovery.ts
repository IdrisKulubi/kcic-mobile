import { authClient } from '@/lib/auth-client';
import { throwIfAuthError } from '@/lib/auth-errors';

export async function requestPasswordResetCode(email: string) {
  const result = await authClient.emailOtp.requestPasswordReset({ email });
  throwIfAuthError(result);
}

export async function verifyPasswordResetCode(email: string, otp: string) {
  const result = await authClient.emailOtp.checkVerificationOtp({
    email,
    otp,
    type: 'forget-password',
  });
  throwIfAuthError(result);
}

export async function resetPasswordWithCode(input: {
  email: string;
  otp: string;
  password: string;
}) {
  const result = await authClient.emailOtp.resetPassword(input);
  throwIfAuthError(result);
}

export async function signInWithNewPassword(email: string, password: string) {
  const result = await authClient.signIn.email({ email, password });
  throwIfAuthError(result);
}
