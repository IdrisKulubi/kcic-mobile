import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
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

import { logo, palette } from '@/components/kcic/ui';
import { useAuth } from '@/context/auth-context';
import { authClient } from '@/lib/auth-client';
import { getStoredAuth } from '@/lib/auth-helpers';

type AuthMode = 'sign-in' | 'sign-up';
async function waitForStoredAuth() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const stored = await getStoredAuth();
    if (stored) return stored;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error('Authentication completed, but the session was not saved on this device.');
}

export default function AuthScreen() {
  const { refreshSession, setAuthenticatedSession } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const client = authClient as any;
      const result =
        mode === 'sign-up'
          ? await client.signUp.email({
              name: name.trim() || email.split('@')[0],
              email: email.trim(),
              password,
            })
          : await client.signIn.email({
              email: email.trim(),
              password,
            });

      if (result?.error) {
        throw new Error(result.error.message || 'Authentication failed.');
      }

      await waitForStoredAuth();
      await refreshSession();
    } catch {
      setError('Auth backend is not ready yet. Use prototype access for the demo.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleAuth = async () => {
    setBusy(true);
    setError(null);

    try {
      const result = await (authClient as any).signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Google authentication failed.');
      }

      await waitForStoredAuth();
      await refreshSession();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in could not be completed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleAppleAuth = async () => {
    setBusy(true);
    setError(null);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple did not return an identity token. Please try again.');
      }

      const result = await (authClient as any).signIn.social({
        provider: 'apple',
        idToken: {
          token: credential.identityToken,
          user: {
            name: {
              firstName: credential.fullName?.givenName ?? undefined,
              lastName: credential.fullName?.familyName ?? undefined,
            },
            email: credential.email ?? undefined,
          },
        },
        callbackURL: '/',
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Apple authentication failed.');
      }

      await waitForStoredAuth();
      await refreshSession();
    } catch (err) {
      const code =
        typeof err === 'object' && err && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';

      if (code !== 'ERR_REQUEST_CANCELED') {
        const message =
          err instanceof Error ? err.message : 'Apple sign-in could not be completed.';
        setError(message);
      }
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
        email: email.trim() || 'idris@kcic.co.ke',
        emailVerified: true,
        role: 'Climate Innovation Member',
        organization: 'Kenya Climate Innovation Center',
        location: 'Nairobi, Kenya',
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              <View style={styles.top}>
                <Image source={logo} style={styles.logo} contentFit="contain" />
                <Text style={styles.title}>Welcome to KCIC Climate Hub</Text>
                <Text style={styles.subtitle}>
                  Sign in to personalize insights, save resources, and track climate innovation updates.
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.modeRow}>
                  {(['sign-in', 'sign-up'] as AuthMode[]).map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => setMode(item)}
                      style={[styles.modeButton, mode === item ? styles.modeButtonActive : null]}>
                      <Text style={[styles.modeText, mode === item ? styles.modeTextActive : null]}>
                        {item === 'sign-in' ? 'Sign In' : 'Create Account'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {mode === 'sign-up' ? (
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Full name"
                    placeholderTextColor={palette.slate}
                    style={styles.input}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                ) : null}

                <TextInput
                  ref={emailInputRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={palette.slate}
                  style={styles.input}
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
                <TextInput
                  ref={passwordInputRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={palette.slate}
                  style={styles.input}
                  autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  secureTextEntry
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable onPress={handleEmailAuth} style={styles.primaryButton} disabled={busy}>
                  {busy ? (
                    <ActivityIndicator color={palette.white} />
                  ) : (
                    <Text style={styles.primaryText}>Continue</Text>
                  )}
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable onPress={handleGoogleAuth} style={styles.providerButton} disabled={busy}>
                  <MaterialIcons name="account-circle" size={21} color={palette.ink} />
                  <Text style={styles.providerText}>Continue with Google</Text>
                </Pressable>

                {appleAvailable ? (
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={9}
                    style={styles.appleButton}
                    onPress={handleAppleAuth}
                  />
                ) : null}

                <Pressable onPress={handlePrototypeAccess} style={styles.prototypeButton}>
                  <Text style={styles.prototypeText}>Enter prototype without backend</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  top: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 132,
    height: 82,
    marginBottom: 22,
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  form: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
    gap: 12,
  },
  modeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    backgroundColor: palette.panel,
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: palette.white,
  },
  modeText: {
    color: palette.slate,
    fontSize: 13,
    fontWeight: '800',
  },
  modeTextActive: {
    color: palette.forest,
  },
  input: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDD5CD',
    paddingHorizontal: 14,
    color: palette.ink,
    fontSize: 15,
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7ECE6',
  },
  dividerText: {
    color: palette.slate,
    fontSize: 12,
    fontWeight: '800',
  },
  providerButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CDD5CD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  providerText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  appleButton: {
    height: 48,
  },
  prototypeButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  prototypeText: {
    color: palette.forest,
    fontSize: 13,
    fontWeight: '900',
  },
});

