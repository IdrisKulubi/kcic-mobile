import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTheme } from '@/components/kcic/profile/profile-theme';
import { logo, palette } from '@/components/kcic/ui';
import type { AuthUser } from '@/lib/auth-helpers';
import { fonts } from '@/lib/typography';

type ProfileHeroCardProps = {
  user: AuthUser;
  colors: ProfileTheme;
  onEditPress: () => void;
};

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return 'KCIC member';
  const year = new Date(createdAt).getFullYear();
  return Number.isFinite(year) ? `Member since ${year}` : 'KCIC member';
}

export function ProfileHeroCard({ user, colors, onEditPress }: ProfileHeroCardProps) {
  const avatarSource = user.image ? { uri: user.image } : logo;
  const isLogoFallback = !user.image;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.avatarRing, { backgroundColor: colors.heroRing }]}>
          <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
            <Image
              source={avatarSource}
              style={[styles.avatar, isLogoFallback && styles.logoAvatar]}
              contentFit={isLogoFallback ? 'contain' : 'cover'}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          onPress={onEditPress}
          style={({ pressed }) => [
            styles.editButton,
            {
              backgroundColor: colors.accentGreen,
              opacity: pressed ? 0.84 : 1,
            },
          ]}>
          <MaterialIcons name="edit" size={16} color={palette.white} />
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
      </View>

      <Text style={[styles.name, { color: colors.ink }]}>{user.name}</Text>
      <Text style={[styles.role, { color: colors.muted }]}>
        {user.role ?? 'Climate Innovation Member'}
        {user.organization ? ` · ${user.organization}` : ''}
      </Text>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
          <MaterialIcons name="location-on" size={14} color={colors.muted} />
          <Text style={[styles.chipText, { color: colors.muted }]}>
            {user.location ?? 'Nairobi, Kenya'}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.chipBg }]}>
          <MaterialIcons name="calendar-today" size={14} color={colors.muted} />
          <Text style={[styles.chipText, { color: colors.muted }]}>
            {formatMemberSince(user.createdAt)}
          </Text>
        </View>
      </View>

      {user.interests && user.interests.length > 0 ? (
        <View style={styles.interestsWrap}>
          {user.interests.slice(0, 4).map((interest) => (
            <View
              key={interest}
              style={[styles.interestPill, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.interestText, { color: colors.ink }]}>{interest}</Text>
            </View>
          ))}
          {user.interests.length > 4 ? (
            <Text style={[styles.moreInterests, { color: colors.muted }]}>
              +{user.interests.length - 4} more
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  logoAvatar: {
    width: 58,
    height: 46,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editLabel: {
    color: palette.white,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 6,
  },
  role: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  interestPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  interestText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  moreInterests: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
