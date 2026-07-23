import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { forwardRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GoogleLogo } from '@/components/kcic/google-logo';
import { palette } from '@/components/kcic/ui';
import { fonts } from '@/lib/typography';

export const AuthField = forwardRef<
  TextInput,
  React.ComponentProps<typeof TextInput> & { label: string; required?: boolean }
>(({ label, required, value, placeholder, onChangeText, ...props }, ref) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
    <TextInput
      ref={ref}
      {...props}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA3AF"
      style={styles.input}
    />
  </View>
));
AuthField.displayName = 'AuthField';

export const PasswordAuthField = forwardRef<
  TextInput,
  Omit<React.ComponentProps<typeof TextInput>, 'secureTextEntry'> & { label?: string; required?: boolean }
>(({ label = 'Password', required = true, value, placeholder, onChangeText, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}>*</Text> : null}
      </Text>
      <View style={styles.passwordWrap}>
        <TextInput
          ref={ref}
          {...props}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA3AF"
          secureTextEntry={!visible}
          style={[styles.input, styles.passwordInput]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.eyeButton}>
          <MaterialIcons name={visible ? 'visibility' : 'visibility-off'} size={20} color="#9AA3AF" />
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
  const label = provider === 'google' ? 'Google' : 'Apple';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.socialButton, pressed ? styles.pressed : null]}>
      {provider === 'google' ? (
        <GoogleLogo size={18} />
      ) : (
        <FontAwesome name="apple" size={20} color={palette.ink} />
      )}
      <Text style={styles.socialText}>{label}</Text>
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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.socialButton, dark ? styles.socialButtonDark : null, pressed ? styles.pressed : null]}>
      <MaterialIcons name={icon} size={20} color={dark ? palette.white : palette.ink} />
      <Text style={[styles.socialText, dark ? styles.socialTextDark : null]}>{label}</Text>
    </Pressable>
  );
}

export function VerificationCodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeWrap} accessibilityLabel="Verification code">
      {digits.map((digit, index) => (
        <View key={index} style={[styles.codeBox, value.length === index ? styles.codeBoxActive : null]}>
          <Text style={styles.codeText}>{digit.trim()}</Text>
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
    color: palette.ink,
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  required: { color: palette.ink },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: palette.ink,
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: '#F9FAFB',
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
    borderColor: '#E5E7EB',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: palette.white,
  },
  socialButtonDark: { backgroundColor: palette.forest, borderColor: palette.forest },
  socialText: {
    color: palette.ink,
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  socialTextDark: { color: palette.white },
  pressed: { opacity: 0.72 },
  codeWrap: { flexDirection: 'row', gap: 8, justifyContent: 'center', position: 'relative' },
  codeBox: {
    width: 46,
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  codeBoxActive: { borderColor: palette.blue, borderWidth: 2 },
  codeText: {
    color: palette.ink,
    fontFamily: fonts.bold,
    fontSize: 21,
    fontWeight: '700',
  },
  hiddenCodeInput: { ...StyleSheet.absoluteFillObject, opacity: 0.01, color: 'transparent' },
});
