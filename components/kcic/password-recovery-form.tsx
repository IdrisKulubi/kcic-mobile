import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AuthField,
  PasswordAuthField,
  VerificationCodeInput,
} from '@/components/kcic/auth-ui';
import { palette } from '@/components/kcic/ui';
import { getAuthErrorToast } from '@/lib/auth-errors';
import {
  requestPasswordResetCode,
  resetPasswordWithCode,
  signInWithNewPassword,
  verifyPasswordResetCode,
} from '@/lib/password-recovery';
import { toast } from '@/lib/toast';
import { fonts } from '@/lib/typography';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

type RecoveryStep = 'email' | 'otp' | 'password';

interface PasswordRecoveryFormProps {
  initialEmail?: string;
  onCancel: () => void;
  onComplete: () => Promise<void>;
}

const recoveryCopy = {
  email: {
    title: 'Reset your password',
    subtitle: 'Enter the email address linked to your KCIC Climate Hub account.',
  },
  otp: {
    title: 'Check your email',
    subtitle: 'Enter the 6-digit password reset code sent to',
  },
  password: {
    title: 'Create a new password',
    subtitle: 'Choose a secure password with at least 8 characters.',
  },
} satisfies Record<RecoveryStep, { title: string; subtitle: string }>;

export function PasswordRecoveryForm({
  initialEmail = '',
  onCancel,
  onComplete,
}: PasswordRecoveryFormProps) {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const normalizedEmail = normalizeEmail(email);
  const copy = recoveryCopy[step];

  const handleRequestCode = async () => {
    if (!isValidEmail(normalizedEmail)) {
      toast.warning('Invalid email', 'Enter a valid email address to continue.');
      return;
    }

    setIsBusy(true);
    try {
      await requestPasswordResetCode(normalizedEmail);
      setOtp('');
      setStep('otp');
      toast.info(
        'Check your email',
        'If this email is registered, a 6-digit password reset code is on its way.'
      );
    } catch (error) {
      toast.show(getAuthErrorToast(error, 'password-reset'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otp.length !== 6) {
      toast.warning('Enter the full code', 'Your password reset code has 6 digits.');
      return;
    }

    setIsBusy(true);
    try {
      await verifyPasswordResetCode(normalizedEmail, otp);
      setStep('password');
    } catch (error) {
      toast.show(getAuthErrorToast(error, 'password-reset'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      toast.warning('Password too short', 'Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      toast.warning('Passwords do not match', 'Enter the same password in both fields.');
      return;
    }

    setIsBusy(true);
    let hasResetPassword = false;
    try {
      await resetPasswordWithCode({ email: normalizedEmail, otp, password });
      hasResetPassword = true;
      await signInWithNewPassword(normalizedEmail, password);
      await onComplete();
      toast.success('Password updated', 'You are signed in with your new password.');
    } catch (error) {
      if (hasResetPassword) {
        toast.warning(
          'Password updated',
          'Your password was changed, but automatic sign-in failed. Please sign in with the new password.'
        );
        onCancel();
        return;
      }
      toast.show(getAuthErrorToast(error, 'password-reset'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleBack = () => {
    if (step === 'password') {
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      setStep('email');
      return;
    }
    onCancel();
  };

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        {step !== 'email' ? <Text style={styles.emailValue}>{normalizedEmail}</Text> : null}
      </View>

      <View style={styles.form}>
        {step === 'email' ? (
          <>
            <AuthField
              label="Email address"
              required
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <RecoveryButton
              label="Send reset code"
              isBusy={isBusy}
              onPress={handleRequestCode}
            />
          </>
        ) : null}

        {step === 'otp' ? (
          <>
            <Text style={styles.formLabel}>Enter password reset code</Text>
            <VerificationCodeInput value={otp} onChange={setOtp} />
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleRequestCode}
              style={styles.inlineLink}>
              <Text style={styles.inlineLinkText}>I didn&apos;t get a code</Text>
            </Pressable>
            <RecoveryButton label="Confirm code" isBusy={isBusy} onPress={handleVerifyCode} />
          </>
        ) : null}

        {step === 'password' ? (
          <>
            <PasswordAuthField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />
            <PasswordAuthField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Enter your password again"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <RecoveryButton
              label="Reset password and sign in"
              isBusy={isBusy}
              onPress={handleResetPassword}
            />
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={handleBack}
          style={styles.footerLink}>
          <Text style={styles.footerLinkText}>
            {step === 'email' ? 'Back to sign in' : 'Go back'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function RecoveryButton({
  label,
  isBusy,
  onPress,
}: {
  label: string;
  isBusy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isBusy}
      onPress={onPress}
      style={[styles.primaryButton, isBusy ? styles.primaryButtonDisabled : null]}>
      {isBusy ? (
        <ActivityIndicator color={palette.white} />
      ) : (
        <Text style={styles.primaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: 28 },
  title: {
    color: palette.ink,
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: palette.slate,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 340,
  },
  emailValue: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  form: { gap: 16 },
  formLabel: {
    color: palette.ink,
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -4,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryText: {
    color: palette.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  inlineLink: { alignItems: 'center', paddingVertical: 2 },
  inlineLinkText: {
    color: palette.slate,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerLink: { alignItems: 'center', marginTop: 4 },
  footerLinkText: {
    color: palette.forest,
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
});
