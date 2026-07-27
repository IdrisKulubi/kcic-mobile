import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTheme } from '@/components/kcic/profile/profile-theme';
import { palette } from '@/components/kcic/ui';
import type { SavedItem } from '@/lib/resolve-saved-items';
import { fonts } from '@/lib/typography';

type ProfileSavedPreviewProps = {
  items: SavedItem[];
  colors: ProfileTheme;
  onItemPress: (item: SavedItem) => void;
  onBrowsePress: () => void;
};

export function ProfileSavedPreview({
  items,
  colors,
  onItemPress,
  onBrowsePress,
}: ProfileSavedPreviewProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
          <MaterialIcons name="bookmark-border" size={22} color={palette.green} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing saved yet</Text>
        <Text style={[styles.emptyCopy, { color: colors.muted }]}>
          Bookmark insights, programmes, and media to find them here quickly.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onBrowsePress}
          style={({ pressed }) => [{ opacity: pressed ? 0.76 : 1 }]}>
          <Text style={[styles.emptyAction, { color: colors.accentGreen }]}>Explore content</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {items.map((item, index) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          onPress={() => onItemPress(item)}
          style={({ pressed }) => [
            styles.row,
            {
              borderTopColor: colors.border,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <View style={styles.thumbWrap}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.iconFallback, { backgroundColor: colors.accentSoft }]}>
                <MaterialIcons name={item.icon} size={20} color={palette.blue} />
              </View>
            )}
          </View>
          <View style={styles.copy}>
            <Text style={[styles.typeLabel, { color: colors.accentGreen }]} numberOfLines={1}>
              {item.typeLabel}
            </Text>
            <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  typeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  emptyCopy: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  emptyAction: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 4,
  },
});
