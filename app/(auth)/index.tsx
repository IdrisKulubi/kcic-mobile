import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthField,
  PasswordAuthField,
  SocialProviderButton,
  VerificationCodeInput,
} from '@/components/kcic/auth-ui';
import { palette } from '@/components/kcic/ui';
import { useAuth } from '@/context/auth-context';
import { authClient } from '@/lib/auth-client';
import { getAuthErrorToast, throwIfAuthError, type AuthAction } from '@/lib/auth-errors';
import { getStoredAuth } from '@/lib/auth-helpers';
import { fonts } from '@/lib/typography';
import { toast } from '@/lib/toast';
import { isValidEmail } from '@/lib/validation';

type AuthMode = 'sign-in' | 'sign-up';
type AuthStep = 'form' | 'verify';

async function waitForStoredAuth() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const stored = await getStoredAuth();
    if (stored) return stored;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Authentication completed, but the session was not saved on this device.');
}

export default function AuthScreen() {
  const router = useRouter();
  const { refreshSession, setAuthenticatedSession } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [step, setStep] = useState<AuthStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  const normalizedEmail = email.trim().toLowerCase();
  const isSignIn = mode === 'sign-in';
  const emailIsValid = isValidEmail(normalizedEmail);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep('form');
  };

  const sendVerificationCode = async () => {
    const result = await (authClient as any).emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: 'email-verification',
    });
    throwIfAuthError(result);
    setCode('');
    setStep('verify');
    toast.info('Check your email', `We sent a 6-digit verification code to ${normalizedEmail}.`);
  };

  const displayNameFromEmail = (value: string) => {
    const local = value.split('@')[0] ?? 'Member';
    return local
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim() || 'KCIC Member';
  };

  const handleEmailAuth = async () => {
    if (!normalizedEmail || !password) {
      toast.warning('Details required', 'Enter your email and password to continue.');
      return;
    }
    if (!emailIsValid) {
      toast.warning('Invalid email', 'Enter a valid email address to continue.');
      return;
    }
    if (password.length < 8) {
      toast.warning('Password too short', 'Use at least 8 characters for your password.');
      return;
    }
    if (mode === 'sign-up' && !agreedToTerms) {
      toast.warning('Agreement required', 'Please agree to the Terms and Privacy Policy to continue.');
      return;
    }

    setBusy(true);
    try {
      const client = authClient as any;
      const signupName = name.trim() || displayNameFromEmail(normalizedEmail);
      const result =
        mode === 'sign-up'
          ? await client.signUp.email({ name: signupName, email: normalizedEmail, password })
          : await client.signIn.email({ email: normalizedEmail, password });
      throwIfAuthError(result);

      if (mode === 'sign-up') {
        setCode('');
        setStep('verify');
        toast.info('Check your email', `We sent a 6-digit verification code to ${normalizedEmail}.`);
        return;
      }

      await waitForStoredAuth();
      await refreshSession();
      toast.success('Welcome back', 'You are signed in.');
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      const codeValue = err instanceof Error && 'code' in err ? String((err as any).code).toUpperCase() : '';
      if (codeValue.includes('EMAIL_NOT_VERIFIED') || message.includes('email is not verified')) {
        try {
          await sendVerificationCode();
        } catch (verificationError) {
          toast.show(getAuthErrorToast(verificationError, 'sign-in'));
        }
      } else {
        toast.show(getAuthErrorToast(err, mode as AuthAction));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.warning('Enter the full code', 'Your verification code has 6 digits.');
      return;
    }
    setBusy(true);
    try {
      const result = await (authClient as any).emailOtp.verifyEmail({ email: normalizedEmail, otp: code });
      throwIfAuthError(result);
      const signInResult = await (authClient as any).signIn.email({ email: normalizedEmail, password });
      throwIfAuthError(signInResult);
      await waitForStoredAuth();
      await refreshSession();
      toast.success('Email verified', 'Welcome to KCIC Climate Hub.');
    } catch (err) {
      toast.show(getAuthErrorToast(err, mode === 'sign-up' ? 'sign-up' : 'sign-in'));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      await sendVerificationCode();
      toast.success('Code resent', 'A fresh verification code is on its way.');
    } catch (err) {
      toast.show(getAuthErrorToast(err, 'sign-in'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleAuth = async () => {
    setBusy(true);
    try {
      const result = await (authClient as any).signIn.social({ provider: 'google', callbackURL: '/' });
      throwIfAuthError(result);
      await waitForStoredAuth();
      await refreshSession();
      toast.success('Signed in with Google', 'Welcome to KCIC Climate Hub.');
    } catch (err) {
      toast.show(getAuthErrorToast(err, 'google'));
    } finally {
      setBusy(false);
    }
  };

  const handleAppleAuth = async () => {
    setBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('Apple did not return an identity token. Please try again.');
      const result = await (authClient as any).signIn.social({
        provider: 'apple',
        idToken: {
          token: credential.identityToken,
          user: {
            name: { firstName: credential.fullName?.givenName, lastName: credential.fullName?.familyName },
            email: credential.email,
          },
        },
        callbackURL: '/',
      });
      throwIfAuthError(result);
      await waitForStoredAuth();
      await refreshSession();
      toast.success('Signed in with Apple', 'Welcome to KCIC Climate Hub.');
    } catch (err) {
      const cancelCode = typeof err === 'object' && err && 'code' in err ? String((err as any).code) : '';
      if (cancelCode !== 'ERR_REQUEST_CANCELED') toast.show(getAuthErrorToast(err, 'apple'));
    } finally {
      setBusy(false);
    }
  };

  const handlePrototypeAccess = async () => {
    await setAuthenticatedSession({
      token: 'prototype-local-session-token',
      user: {
        id: 'prototype-user-idris',
        name: name.trim() || 'Idris Kulubi',
        email: normalizedEmail || 'idris@kcic.co.ke',
        emailVerified: true,
        role: 'Climate Innovation Member',
        organization: 'Kenya Climate Innovation Center',
        location: 'Nairobi, Kenya',
      },
    });
    toast.info('Prototype session', 'You are viewing the app with local demo data.');
  };

  const heroTitle =
    step === 'verify'
      ? 'Check your email'
      : isSignIn
        ? 'Welcome back!'
        : 'Join KCIC Climate Hub';

  const heroSubtitle =
    step === 'verify'
      ? "We've sent your email verification code to"
      : isSignIn
        ? "Sign in to discover insights, events, and opportunities across Kenya's climate innovation ecosystem."
        : 'Join now to start discovering insights, events, and opportunities across Kenya\'s climate innovation ecosystem.';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#E3F3EA', '#F4F8FF', '#FEFFFC']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.content}>
                <View style={styles.navRow}>
                  <Pressable
                    onPress={() => (step === 'verify' ? setStep('form') : router.canGoBack() ? router.back() : undefined)}
                    style={styles.backButton}
                    accessibilityLabel="Go back">
                    <MaterialIcons name="arrow-back" size={22} color={palette.ink} />
                  </Pressable>
                  <View style={styles.navSpacer} />
                  {step === 'form' ? (
                    <Pressable onPress={() => switchMode(isSignIn ? 'sign-up' : 'sign-in')} hitSlop={8}>
                      <Text style={styles.navAction}>{isSignIn ? 'Sign up' : 'Sign in'}</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.navSpacer} />
                  )}
                </View>

                <View style={styles.hero}>
                  <Text style={styles.title}>{heroTitle}</Text>
                  <Text style={styles.subtitle}>{heroSubtitle}</Text>
                  {step === 'verify' ? <Text style={styles.emailValue}>{normalizedEmail}</Text> : null}
                </View>

                {step === 'verify' ? (
                  <View style={styles.form}>
                    <Text style={styles.formLabel}>Enter verification code</Text>
                    <VerificationCodeInput value={code} onChange={setCode} />
                    <Pressable onPress={handleResend} disabled={busy} style={styles.inlineLink}>
                      <Text style={styles.inlineLinkText}>I didn&apos;t get a code</Text>
                    </Pressable>
                    <Pressable onPress={handleVerify} disabled={busy} style={styles.primaryButton}>
                      {busy ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryText}>Verify email</Text>}
                    </Pressable>
                    <Pressable onPress={() => setStep('form')} style={styles.footerLink}>
                      <Text style={styles.footerLinkText}>Use a different email</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.form}>
                    <AuthField
                      ref={emailInputRef}
                      label="Email address"
                      required
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />

                    <PasswordAuthField
                      ref={passwordInputRef}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="At least 8 characters"
                      autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                      textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    {isSignIn ? (
                      <View style={styles.helperRow}>
                        <Pressable onPress={() => setRememberMe((current) => !current)} style={styles.remember}>
                          <MaterialIcons
                            name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
                            size={20}
                            color={rememberMe ? palette.forest : '#9AA3AF'}
                          />
                          <Text style={styles.helperText}>Remember me</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => toast.info('Password reset', 'Password recovery will be connected to email OTP next.')}>
                          <Text style={styles.linkText}>Forgot password?</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setAgreedToTerms((current) => !current)}
                        style={styles.termsRow}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: agreedToTerms }}>
                        <MaterialIcons
                          name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
                          size={20}
                          color={agreedToTerms ? palette.forest : '#9AA3AF'}
                        />
                        <Text style={styles.termsText}>
                          I agree with{' '}
                          <Text
                            style={styles.termsLink}
                            onPress={() => toast.info('Terms', 'KCIC terms of use will open here.')}>
                            Terms
                          </Text>
                          ,{' '}
                          <Text
                            style={styles.termsLink}
                            onPress={() => toast.info('Privacy Policy', 'KCIC privacy policy will open here.')}>
                            Privacy Policy
                          </Text>
                          .
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={handleEmailAuth}
                      disabled={busy || (!isSignIn && !agreedToTerms)}
                      style={[
                        styles.primaryButton,
                        !isSignIn && !agreedToTerms ? styles.primaryButtonDisabled : null,
                      ]}>
                      {busy ? (
                        <ActivityIndicator color={palette.white} />
                      ) : (
                        <Text style={styles.primaryText}>{isSignIn ? 'Sign in' : 'Create Account'}</Text>
                      )}
                    </Pressable>

                    <View style={styles.dividerRow}>
                      <View style={styles.divider} />
                      <Text style={styles.dividerText}>or Continue with</Text>
                      <View style={styles.divider} />
                    </View>

                    <View style={styles.providerRow}>
                      <SocialProviderButton provider="google" onPress={handleGoogleAuth} disabled={busy} />
                      <SocialProviderButton
                        provider="apple"
                        onPress={handleAppleAuth}
                        disabled={busy || (Platform.OS === 'ios' && !appleAvailable)}
                      />
                    </View>

                   
                  </View>
                )}

                {step === 'form' ? (
                  <Pressable onPress={() => switchMode(isSignIn ? 'sign-up' : 'sign-in')} style={styles.footerPrompt}>
                    <Text style={styles.footerPromptText}>
                      {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                      <Text style={styles.footerPromptAction}>
                        {isSignIn ? 'Sign up →' : '→ Sign In'}
                      </Text>
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: 'transparent' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  navRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSpacer: { width: 44 },
  navAction: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
  },
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
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helperText: {
    color: palette.slate,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  linkText: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: -2,
  },
  termsText: {
    flex: 1,
    color: palette.slate,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  termsLink: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#C5D4C8',
    opacity: 0.7,
  },
  primaryText: {
    color: palette.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: {
    color: '#9AA3AF',
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  providerRow: { flexDirection: 'row', gap: 12 },
  prototypeButton: { alignItems: 'center', paddingVertical: 4 },
  prototypeText: {
    color: palette.forest,
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
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
  footerPrompt: { alignItems: 'center', marginTop: 28 },
  footerPromptText: {
    color: palette.slate,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  footerPromptAction: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
});
