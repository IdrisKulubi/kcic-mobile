import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileThemes } from '@/components/kcic/profile/profile-theme';
import { ProfileSettingsRow } from '@/components/kcic/profile/profile-settings-row';
import { palette } from '@/components/kcic/ui';
import { useAuth } from '@/context/auth-context';
import { hapticLight } from '@/lib/haptics';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  loadNotificationPreferences,
  type NotificationPreferenceKey,
  type NotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notification-preferences';
import { toast } from '@/lib/toast';
import { fonts } from '@/lib/typography';

type SettingSlug = 'notification-preferences' | 'security-settings' | 'language-region';

const SETTING_META: Record<
  SettingSlug,
  { title: string; description: string }
> = {
  'notification-preferences': {
    title: 'Notification Preferences',
    description: 'Choose how KCIC reaches you about reports, events, and ecosystem updates.',
  },
  'security-settings': {
    title: 'Security Settings',
    description: 'Manage password, two-factor authentication, and connected sign-in methods.',
  },
  'language-region': {
    title: 'Language & Region',
    description: 'Set your preferred language and timezone for events and content.',
  },
};

const NOTIFICATION_OPTIONS: Array<{
  key: NotificationPreferenceKey;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'emailDigests',
    title: 'Email digests',
    subtitle: 'Weekly highlights and programme updates',
  },
  {
    key: 'pushAlerts',
    title: 'Push alerts',
    subtitle: 'Important announcements on this device',
  },
  {
    key: 'eventReminders',
    title: 'Event reminders',
    subtitle: 'Reminders before events you register for',
  },
  {
    key: 'podcastReleases',
    title: 'Podcast releases',
    subtitle: 'New KCIC Podcast and Sustainably Speaking episodes',
  },
];

const LANGUAGE_OPTIONS = [
  { id: 'en-uk', label: 'English (UK)', available: true },
  { id: 'sw-ke', label: 'Kiswahili', available: false },
] as const;

const TIMEZONE_OPTIONS = [
  { id: 'eat', label: 'East Africa Time (EAT)', available: true },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? profileThemes.dark : profileThemes.light;
  const { user } = useAuth();
  const settingSlug = slug as SettingSlug | undefined;
  const setting = settingSlug ? SETTING_META[settingSlug] : undefined;

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loadingPrefs, setLoadingPrefs] = useState(settingSlug === 'notification-preferences');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-uk');
  const [selectedTimezone, setSelectedTimezone] = useState('eat');

  useEffect(() => {
    if (settingSlug !== 'notification-preferences' || !user?.id) {
      setLoadingPrefs(false);
      return;
    }

    loadNotificationPreferences(user.id)
      .then(setPreferences)
      .finally(() => setLoadingPrefs(false));
  }, [settingSlug, user?.id]);

  const handleClose = () => {
    hapticLight();
    router.back();
  };

  const handleTogglePreference = useCallback(
    async (key: NotificationPreferenceKey, value: boolean) => {
      if (!user?.id) return;

      const next = { ...preferences, [key]: value };
      setPreferences(next);
      setSavingPrefs(true);

      try {
        await saveNotificationPreferences(user.id, next);
        toast.success('Preferences saved', 'Your notification settings were updated.');
      } catch {
        setPreferences(preferences);
        toast.error('Could not save', 'Please try again.');
      } finally {
        setSavingPrefs(false);
      }
    },
    [preferences, user?.id]
  );

  if (!setting) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.muted }]}>Setting not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            hitSlop={8}
            onPress={handleClose}
            style={({ pressed }) => [
              styles.headerButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <MaterialIcons name="close" size={20} color={colors.ink} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.ink }]}>{setting.title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.description, { color: colors.muted }]}>{setting.description}</Text>

          {settingSlug === 'notification-preferences' ? (
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {loadingPrefs ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={colors.accentGreen} />
                </View>
              ) : (
                NOTIFICATION_OPTIONS.map((option, index) => (
                  <View
                    key={option.key}
                    style={[
                      styles.toggleRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <View style={styles.toggleCopy}>
                      <Text style={[styles.toggleTitle, { color: colors.ink }]}>{option.title}</Text>
                      <Text style={[styles.toggleSubtitle, { color: colors.muted }]}>
                        {option.subtitle}
                      </Text>
                    </View>
                    <Switch
                      value={preferences[option.key]}
                      onValueChange={(value) => {
                        hapticLight();
                        handleTogglePreference(option.key, value);
                      }}
                      disabled={savingPrefs}
                      trackColor={{ false: colors.surfaceAlt, true: palette.green }}
                      thumbColor={palette.white}
                    />
                  </View>
                ))
              )}
            </View>
          ) : null}

          {settingSlug === 'security-settings' ? (
            <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ProfileSettingsRow
                icon="password"
                title="Change password"
                subtitle="Reset via email verification"
                colors={colors}
                isFirst
                onPress={() =>
                  toast.info(
                    'Password reset',
                    'Use the Forgot password link on the sign-in screen to reset your password.'
                  )
                }
              />
              <ProfileSettingsRow
                icon="verified-user"
                title="Two-factor authentication"
                subtitle={
                  user?.twoFactorEnabled
                    ? 'Enabled on your account'
                    : 'Add an extra layer of protection'
                }
                colors={colors}
                rightElement={
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: user?.twoFactorEnabled
                          ? 'rgba(128, 199, 56, 0.16)'
                          : colors.surfaceAlt,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: user?.twoFactorEnabled ? colors.accentGreen : colors.muted },
                      ]}>
                      {user?.twoFactorEnabled ? 'On' : 'Off'}
                    </Text>
                  </View>
                }
                showChevron={false}
              />
              <ProfileSettingsRow
                icon="link"
                title="Connected accounts"
                subtitle={user?.email ? `Signed in as ${user.email}` : 'Google or Apple sign-in'}
                colors={colors}
                showChevron={false}
              />
              <ProfileSettingsRow
                icon="devices"
                title="Active sessions"
                subtitle="Manage where you are signed in"
                colors={colors}
                onPress={() =>
                  toast.info(
                    'Active sessions',
                    'Session management will be available in a future release.'
                  )
                }
              />
            </View>
          ) : null}

          {settingSlug === 'language-region' ? (
            <>
              <Text style={[styles.groupLabel, { color: colors.muted }]}>Language</Text>
              <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {LANGUAGE_OPTIONS.map((option, index) => (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    disabled={!option.available}
                    onPress={() => {
                      if (!option.available) return;
                      hapticLight();
                      setSelectedLanguage(option.id);
                      toast.success('Language updated', 'English (UK) is now your preferred language.');
                    }}
                    style={({ pressed }) => [
                      styles.choiceRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                        opacity: !option.available ? 0.55 : pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Text style={[styles.choiceTitle, { color: colors.ink }]}>{option.label}</Text>
                    {option.available ? (
                      selectedLanguage === option.id ? (
                        <MaterialIcons name="check-circle" size={20} color={colors.accentGreen} />
                      ) : (
                        <View style={[styles.radio, { borderColor: colors.border }]} />
                      )
                    ) : (
                      <Text style={[styles.comingSoon, { color: colors.muted }]}>Coming soon</Text>
                    )}
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.groupLabel, { color: colors.muted }]}>Timezone</Text>
              <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {TIMEZONE_OPTIONS.map((option, index) => (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    onPress={() => {
                      hapticLight();
                      setSelectedTimezone(option.id);
                      toast.success('Timezone updated', 'East Africa Time is now selected.');
                    }}
                    style={({ pressed }) => [
                      styles.choiceRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}>
                    <Text style={[styles.choiceTitle, { color: colors.ink }]}>{option.label}</Text>
                    {selectedTimezone === option.id ? (
                      <MaterialIcons name="check-circle" size={20} color={colors.accentGreen} />
                    ) : (
                      <View style={[styles.radio, { borderColor: colors.border }]} />
                    )}
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 12,
  },
  description: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  toggleSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  groupLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 8,
    marginBottom: -4,
    paddingHorizontal: 2,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  choiceTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  comingSoon: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  error: {
    padding: 24,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
