import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openContent, openSettings } from '@/lib/navigation';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { showAddTopic, showEditProfile, showOpenResource } from '@/components/kcic/feedback';
import {
  AppScreen,
  Card,
  Pill,
  PrimaryButton,
  profileAvatar,
  SectionTitle,
  TopBar,
  palette,
} from '@/components/kcic/ui';
import { useAuth } from '@/context/auth-context';
import { usePrototype } from '@/context/prototype-context';
import { bookmarkKey, events, savedResources } from '@/data/kcic';

const SETTING_SLUGS: Record<string, string> = {
  'Notification Preferences': 'notification-preferences',
  'Language & Region': 'language-region',
  'Security Settings': 'security-settings',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { hasUnreadNotifications, interests, removeInterest, addInterest, toggleBookmark, isBookmarked } =
    usePrototype();

  const profileEvent = events[1];

  return (
    <AppScreen>
      <TopBar
        showProfileAvatar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <View style={styles.profileHeader}>
        <Pressable onPress={showEditProfile}>
          <Image source={profileAvatar} style={styles.profileImage} contentFit="cover" />
          <View style={styles.editBadge}>
            <MaterialIcons name="edit" size={16} color={palette.limeDark} />
          </View>
        </Pressable>
        <Text style={styles.name}>{user?.name ?? 'KCIC Member'}</Text>
        <Text style={styles.role}>
          {user?.role ?? 'Climate Innovation Member'}
          {user?.organization ? `, ${user.organization}` : ''}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.infoBadge}>
            <MaterialIcons name="location-on" size={13} color={palette.slate} />
            <Text style={styles.infoBadgeText}>{user?.location ?? 'Nairobi, Kenya'}</Text>
          </View>
          <View style={styles.infoBadge}>
            <MaterialIcons name="calendar-today" size={13} color={palette.slate} />
            <Text style={styles.infoBadgeText}>
              {user?.createdAt ? `Joined ${new Date(user.createdAt).getFullYear()}` : 'Prototype session'}
            </Text>
          </View>
        </View>
        <PrimaryButton label="Edit Profile" onPress={showEditProfile} />
      </View>

      <Card style={styles.section}>
        <SectionTitle title="My Interests" icon="edit" />
        <View style={styles.topicWrap}>
          {interests.map((topic) => (
            <Pill key={topic} label={topic} onPress={() => removeInterest(topic)} />
          ))}
          <Pill label="+ Add Topic" tone="blue" onPress={() => showAddTopic(addInterest)} />
        </View>
      </Card>

      <Card style={styles.section}>
        <SectionTitle
          title="Saved Resources"
          action="View All"
          onPressAction={() => router.push('/library')}
        />
        {savedResources.map((resource) => {
          const bKey = bookmarkKey('resource', resource.id);
          const saved = isBookmarked(bKey);

          return (
            <Pressable
              key={resource.id}
              style={styles.resourceRow}
              onPress={() => showOpenResource(resource.title, resource.detail)}>
              <View style={styles.resourceIcon}>
                <MaterialIcons
                  name={resource.icon as keyof typeof MaterialIcons.glyphMap}
                  size={24}
                  color={palette.blue}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDetail}>{resource.detail}</Text>
              </View>
              <Pressable onPress={() => toggleBookmark(bKey)} hitSlop={8}>
                <MaterialIcons
                  name={saved ? 'bookmark' : 'bookmark-border'}
                  size={22}
                  color={palette.forest}
                />
              </Pressable>
            </Pressable>
          );
        })}
      </Card>

      <Card style={styles.section}>
        <SectionTitle title="My Events" />
        <View style={styles.upcomingBox}>
          <Text style={styles.upcomingLabel}>Upcoming</Text>
          <Text style={styles.upcomingTitle}>{profileEvent.title}</Text>
          <Text style={styles.resourceDetail}>
            {profileEvent.date}, {profileEvent.time}
          </Text>
          <PrimaryButton
            label="View Details"
            variant="outline"
            onPress={() => openContent('event', profileEvent.id)}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.settingsTitle}>Preferences & Settings</Text>
        <Text style={styles.settingsIntro}>Manage your account configurations and notifications.</Text>
        {[
          ['notifications-none', 'Notification Preferences', 'Manage email and push alerts'],
          ['language', 'Language & Region', 'English (UK), East Africa Time'],
          ['lock-outline', 'Security Settings', 'Password, 2FA, connected accounts'],
        ].map(([icon, title, detail]) => (
          <Pressable
            key={title}
            style={styles.settingRow}
            onPress={() => openSettings(SETTING_SLUGS[title])}>
            <View style={styles.settingIcon}>
              <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={22} color={palette.slate} />
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>{title}</Text>
              <Text style={styles.resourceDetail}>{detail}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A3B0A0" />
          </Pressable>
        ))}
        <Pressable style={styles.signOutRow} onPress={signOut}>
          <MaterialIcons name="logout" size={22} color={palette.danger} />
          <View style={styles.resourceText}>
            <Text style={styles.signOutTitle}>Sign Out</Text>
            <Text style={styles.resourceDetail}>Clear this device session</Text>
          </View>
        </Pressable>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    marginBottom: 26,
  },
  profileImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 4,
    borderColor: palette.white,
  },
  editBadge: {
    position: 'absolute',
    right: 2,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  name: {
    color: palette.ink,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
    marginTop: 28,
  },
  role: {
    color: palette.slate,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8EEF9',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  infoBadgeText: {
    color: palette.slate,
    fontSize: 11,
    fontWeight: '800',
  },
  section: {
    marginBottom: 22,
  },
  topicWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  resourceIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF8FC',
  },
  resourceText: {
    flex: 1,
  },
  resourceTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  resourceDetail: {
    color: palette.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  upcomingBox: {
    gap: 9,
    borderRadius: 12,
    backgroundColor: palette.panel,
    padding: 16,
  },
  upcomingLabel: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '900',
  },
  upcomingTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  settingsTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  settingsIntro: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6FF',
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
  signOutTitle: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '900',
  },
});
