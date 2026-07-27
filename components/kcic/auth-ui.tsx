import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { forwardRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuthTheme } from '@/components/kcic/auth/auth-theme';
import { GoogleLogo } from '@/components/kcic/google-logo';
import { fonts } from '@/lib/typography';

export const AuthField = forwardRef<
  TextInput,
  React.ComponentProps<typeof TextInput> & { label: string; required?: boolean }
>(({ label, required, value, placeholder, onChangeText, style, ...props }, ref) => {
  const colors = useAuthTheme();

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.ink }]}>
        {label}
        {required ? <Text style={{ color: colors.ink }}>*</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        {...props}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={[
          styles.input,
          {
            color: colors.ink,
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
          },
          style,
        ]}
      />
    </View>
  );
});
AuthField.displayName = 'AuthField';

export const PasswordAuthField = forwardRef<
  TextInput,
  Omit<React.ComponentProps<typeof TextInput>, 'secureTextEntry'> & { label?: string; required?: boolean }
>(({ label = 'Password', required = true, value, placeholder, onChangeText, style, ...props }, ref) => {
  const colors = useAuthTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.ink }]}>
        {label}
        {required ? <Text style={{ color: colors.ink }}>*</Text> : null}
      </Text>
      <View style={styles.passwordWrap}>
        <TextInput
          ref={ref}
          {...props}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!visible}
          style={[
            styles.input,
            styles.passwordInput,
            {
              color: colors.ink,
              borderColor: colors.border,
              backgroundColor: colors.surfaceMuted,
            },
            style,
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.eyeButton}>
          <MaterialIcons
            name={visible ? 'visibility' : 'visibility-off'}
            size={20}
            color={colors.placeholder}
          />
        </Pressable>
      </View>
    </View>
  );
});
PasswordAuthField.displayName = 'PasswordAuthField';

export function SocialProviderButton({
  provider,
  onPress,
  disabled,
}: {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useAuthTheme();
  const label = provider === 'google' ? 'Google' : 'Apple';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
        },
      ]}>
      {provider === 'google' ? (
        <GoogleLogo size={18} />
      ) : (
        <FontAwesome name="apple" size={20} color={colors.appleIcon} />
      )}
      <Text style={[styles.socialText, { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** @deprecated Use SocialProviderButton instead */
export function ProviderButton({
  icon,
  label,
  onPress,
  dark = false,
  disabled,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  const colors = useAuthTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        {
          borderColor: dark ? colors.accent : colors.border,
          backgroundColor: dark ? colors.accent : colors.surface,
          opacity: pressed ? 0.72 : 1,
        },
      ]}>
      <MaterialIcons name={icon} size={20} color={dark ? colors.primaryText : colors.ink} />
      <Text style={[styles.socialText, { color: dark ? colors.primaryText : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function VerificationCodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const colors = useAuthTheme();
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeWrap} accessibilityLabel="Verification code">
      {digits.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.codeBox,
            {
              borderColor: value.length === index ? colors.codeActive : colors.border,
              borderWidth: value.length === index ? 2 : 1,
              backgroundColor: colors.surfaceMuted,
            },
          ]}>
          <Text style={[styles.codeText, { color: colors.ink }]}>{digit.trim()}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        autoFocus
        caretHidden
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
        style={styles.hiddenCodeInput}
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500',
  },
  passwordWrap: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 48 },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: 54,
    justifyContent: 'center',
  },
  socialButton: {
    minHeight: 52,
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  codeWrap: { flexDirection: 'row', gap: 8, justifyContent: 'center', position: 'relative' },
  codeBox: {
    width: 46,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontFamily: fonts.bold,
    fontSize: 21,
    fontWeight: '700',
  },
  hiddenCodeInput: { ...StyleSheet.absoluteFillObject, opacity: 0.01, color: 'transparent' },
});
