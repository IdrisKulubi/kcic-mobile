import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EditProfileSheet,
  type ProfileFormValues,
} from '@/components/kcic/profile/edit-profile-sheet';
import { ProfileEventsSection } from '@/components/kcic/profile/profile-events-section';
import { ProfileHeroCard } from '@/components/kcic/profile/profile-hero-card';
import { ProfileSavedPreview } from '@/components/kcic/profile/profile-saved-preview';
import { ProfileSection } from '@/components/kcic/profile/profile-section';
import { ProfileSettingsRow } from '@/components/kcic/profile/profile-settings-row';
import { profileThemes } from '@/components/kcic/profile/profile-theme';
import { useAuth } from '@/context/auth-context';
import { useBookmarks } from '@/context/bookmarks-context';
import { useContent } from '@/context/content-context';
import { useMedia } from '@/context/media-context';
import { useMediaPlayer } from '@/context/media-player-context';
import { usePrototype } from '@/context/prototype-context';
import { events } from '@/data/kcic';
import { hapticLight } from '@/lib/haptics';
import { openContent, openSettings } from '@/lib/navigation';
import { openSavedItem } from '@/lib/open-saved-item';
import { updateProfile } from '@/lib/profile-api';
import { resolveSavedItems } from '@/lib/resolve-saved-items';
import { toast } from '@/lib/toast';
import { fonts } from '@/lib/typography';

const SETTING_SLUGS = {
  notifications: 'notification-preferences',
  security: 'security-settings',
  language: 'language-region',
} as const;

export default function ProfileScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? profileThemes.dark : profileThemes.light;
  const { status, user, token, signOut, updateUser } = useAuth();
  const { bookmarks } = useBookmarks();
  const { articles, programmes, opportunities } = useContent();
  const { getItemById } = useMedia();
  const { play } = useMediaPlayer();
  const { rsvpEvents } = usePrototype();
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const savedItems = useMemo(
    () =>
      resolveSavedItems({
        bookmarks,
        articles,
        programmes,
        opportunities,
        getItemById,
      }),
    [articles, bookmarks, getItemById, opportunities, programmes]
  );

  const savedPreview = useMemo(() => savedItems.slice(0, 3), [savedItems]);

  const registeredEvents = useMemo(
    () => events.filter((event) => rsvpEvents.has(event.id)),
    [rsvpEvents]
  );

  const handleClose = () => {
    hapticLight();
    router.back();
  };

  const handleSaveProfile = useCallback(
    async (values: ProfileFormValues) => {
      if (!user) return;

      setSaving(true);
      try {
        const payload = {
          name: values.name,
          organization: values.organization || null,
          location: values.location || null,
          interests: values.interests,
        };

        if (token === 'prototype-local-session-token') {
          await updateUser({ ...user, ...payload });
          toast.success('Profile updated', 'Your details were saved for this session.');
          setEditVisible(false);
          return;
        }

        const updated = await updateProfile(payload);
        await updateUser(updated);
        toast.success('Profile updated', 'Your account details have been saved.');
        setEditVisible(false);
      } catch {
        toast.error('Could not save profile', 'Please check your connection and try again.');
      } finally {
        setSaving(false);
      }
    },
    [token, updateUser, user]
  );

  if (status === 'loading') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accentGreen} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.loadingWrap}>
          <Text style={[styles.loadingText, { color: colors.muted }]}>Sign in to view your profile.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(auth)' as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <Text style={[styles.signInLink, { color: colors.accentGreen }]}>Go to sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
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
          <MaterialIcons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ProfileHeroCard
          user={user}
          colors={colors}
          onEditPress={() => {
            hapticLight();
            setEditVisible(true);
          }}
        />

        <ProfileSection
          title="Saved"
          action={savedItems.length > 0 ? 'View all' : undefined}
          onAction={
            savedItems.length > 0
              ? () => {
                  hapticLight();
                  router.push('/(tabs)/saved' as never);
                }
              : undefined
          }
          colors={colors}>
          <ProfileSavedPreview
            items={savedPreview}
            colors={colors}
            onItemPress={(item) =>
              openSavedItem(item, {
                getMediaItem: getItemById,
                playMedia: play,
              })
            }
            onBrowsePress={() => router.push('/(tabs)/explore' as never)}
          />
        </ProfileSection>

        <ProfileSection title="Registered Events" colors={colors}>
          <ProfileEventsSection
            events={registeredEvents}
            colors={colors}
            onEventPress={(eventId) => {
              hapticLight();
              openContent('event', eventId);
            }}
            onBrowsePress={() => router.push('/(tabs)/events' as never)}
          />
        </ProfileSection>

        <ProfileSection title="Account" colors={colors}>
          <ProfileSettingsRow
            icon="notifications-none"
            title="Notification Preferences"
            subtitle="Email, push, events, and podcast alerts"
            colors={colors}
            isFirst
            onPress={() => {
              hapticLight();
              openSettings(SETTING_SLUGS.notifications);
            }}
          />
          <ProfileSettingsRow
            icon="lock-outline"
            title="Security Settings"
            subtitle="Password, 2FA, and connected accounts"
            colors={colors}
            onPress={() => {
              hapticLight();
              openSettings(SETTING_SLUGS.security);
            }}
          />
          <ProfileSettingsRow
            icon="language"
            title="Language & Region"
            subtitle="English (UK), East Africa Time"
            colors={colors}
            onPress={() => {
              hapticLight();
              openSettings(SETTING_SLUGS.language);
            }}
          />
          <ProfileSettingsRow
            icon="logout"
            title="Sign Out"
            subtitle="Clear this device session"
            colors={colors}
            destructive
            showChevron={false}
            onPress={() => {
              hapticLight();
              signOut();
            }}
          />
        </ProfileSection>
      </ScrollView>

      <EditProfileSheet
        visible={editVisible}
        user={user}
        saving={saving}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveProfile}
      />
    </SafeAreaView>
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
    paddingBottom: 32,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    textAlign: 'center',
  },
  signInLink: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
