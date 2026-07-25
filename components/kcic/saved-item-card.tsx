import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/kcic/ui';
import type { SavedItem } from '@/lib/resolve-saved-items';
import { fonts } from '@/lib/typography';

type SavedItemCardProps = {
  item: SavedItem;
  colors: {
    surface: string;
    ink: string;
    muted: string;
    border: string;
    accentSoft: string;
    imageShade: string;
  };
  onPress: () => void;
  onRemove: () => void;
};

export function SavedItemCard({ item, colors, onPress, onRemove }: SavedItemCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.84 : 1,
        },
      ]}>
      <View style={styles.thumbnailWrap}>
        {item.imageUrl ? (
          <>
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
            <View style={[styles.thumbnailShade, { backgroundColor: colors.imageShade }]} />
            {item.showPlayBadge ? (
              <View style={styles.playBadge}>
                <MaterialIcons name="play-arrow" size={20} color={palette.white} />
              </View>
            ) : null}
          </>
        ) : (
          <View style={[styles.iconFallback, { backgroundColor: colors.accentSoft }]}>
            <MaterialIcons name={item.icon} size={26} color={palette.blue} />
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <Text style={[styles.typeLabel, { color: palette.green }]} numberOfLines={1}>
          {item.typeLabel}
        </Text>
        <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]} numberOfLines={1}>
          {item.meta}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.title} from saved`}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}>
          <MaterialIcons name="bookmark" size={20} color={palette.green} />
        </Pressable>
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailShade: {
    ...StyleSheet.absoluteFillObject,
  },
  playBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 17, 0.62)',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  typeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
});
