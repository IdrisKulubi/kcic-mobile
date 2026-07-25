import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/kcic/ui';
import { formatContentDate } from '@/lib/content-api';
import type { MediaItem } from '@/lib/media-api';
import { fonts } from '@/lib/typography';

type MediaItemCardProps = {
  item: MediaItem;
  colors: {
    surface: string;
    ink: string;
    muted: string;
    border: string;
    imageShade: string;
  };
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
  onShare: () => void;
};

export function MediaItemCard({
  item,
  colors,
  saved,
  onPress,
  onToggleSave,
  onShare,
}: MediaItemCardProps) {
  const footerIcon = item.kind === 'podcast' ? 'mic' : 'videocam';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.ink }]} numberOfLines={3}>
          {item.title}
        </Text>
        <View style={styles.thumbnailWrap}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} contentFit="cover" />
          <View style={[styles.thumbnailShade, { backgroundColor: colors.imageShade }]} />
          <View style={styles.playBadge}>
            <MaterialIcons name="play-arrow" size={24} color={palette.white} />
          </View>
        </View>
      </View>

      <Text style={[styles.summary, { color: colors.muted }]} numberOfLines={3}>
        {item.summary || 'Watch the latest from KCIC Climate Innovation Center.'}
      </Text>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <MaterialIcons name={footerIcon} size={14} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {formatContentDate(item.publishedAt)}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove bookmark' : 'Save media'}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}>
            <MaterialIcons
              name={saved ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={saved ? palette.green : colors.muted}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share media"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onShare();
            }}>
            <MaterialIcons name="share" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function MediaListSkeleton({
  colors,
  rows = 4,
}: {
  colors: { surface: string; border: string; surfaceAlt: string };
  rows?: number;
}) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonTitleBlock}>
              <View style={[styles.skeletonLine, styles.skeletonLineWide, { backgroundColor: colors.surfaceAlt }]} />
              <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceAlt }]} />
              <View style={[styles.skeletonLine, styles.skeletonLineShort, { backgroundColor: colors.surfaceAlt }]} />
            </View>
            <View style={[styles.skeletonThumb, { backgroundColor: colors.surfaceAlt }]} />
          </View>
          <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.skeletonLine, styles.skeletonLineShort, { backgroundColor: colors.surfaceAlt }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  thumbnailWrap: {
    width: 88,
    height: 88,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailShade: {
    ...StyleSheet.absoluteFillObject,
  },
  playBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  skeletonList: {
    gap: 0,
  },
  skeletonCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  skeletonTitleBlock: {
    flex: 1,
    gap: 8,
  },
  skeletonThumb: {
    width: 88,
    height: 88,
    borderRadius: 4,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLineWide: {
    width: '92%',
    height: 16,
  },
  skeletonLineShort: {
    width: '68%',
  },
});
