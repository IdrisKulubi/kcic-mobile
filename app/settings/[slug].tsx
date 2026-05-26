import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, palette } from '@/components/kcic/ui';
import { showPrototypeAlert } from '@/components/kcic/feedback';

const SETTINGS: Record<string, { title: string; description: string; options: string[] }> = {
  'notification-preferences': {
    title: 'Notification Preferences',
    description: 'Manage how KCIC reaches you about reports, events, and ecosystem updates.',
    options: ['Email digests', 'Push alerts', 'Event reminders', 'Podcast releases'],
  },
  'language-region': {
    title: 'Language & Region',
    description: 'Set your preferred language and timezone for events and content.',
    options: ['English (UK)', 'Kiswahili (coming soon)', 'East Africa Time (EAT)'],
  },
  'security-settings': {
    title: 'Security Settings',
    description: 'Protect your account with password and two-factor authentication.',
    options: ['Change password', 'Enable 2FA', 'Connected accounts', 'Active sessions'],
  },
};

export default function SettingsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const setting = SETTINGS[slug ?? ''];

  if (!setting) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Setting not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: setting.title, headerBackVisible: false }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <Text style={styles.description}>{setting.description}</Text>
        {setting.options.map((option) => (
          <View key={option} style={styles.optionRow}>
            <Text style={styles.optionText}>{option}</Text>
            <Text style={styles.comingSoon}>Prototype</Text>
          </View>
        ))}
        <PrimaryButton
          label="Save changes"
          onPress={() =>
            showPrototypeAlert('Saved', `${setting.title} preferences updated for this prototype session.`)
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.shell,
    padding: 20,
    gap: 12,
  },
  description: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 16,
  },
  optionText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  comingSoon: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  error: {
    padding: 24,
    color: palette.slate,
  },
});
