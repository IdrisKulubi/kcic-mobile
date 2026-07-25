import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SavedFilterChips } from '@/components/kcic/saved-filter-chips';
import { SavedItemCard } from '@/components/kcic/saved-item-card';
import { SavedListSkeleton } from '@/components/kcic/saved-list-skeleton';
import { palette } from '@/components/kcic/ui';
import { useContent } from '@/context/content-context';
import { useGlobalHeader } from '@/context/global-header-context';
import { useMedia } from '@/context/media-context';
import { useMediaPlayer } from '@/context/media-player-context';
import { usePrototype } from '@/context/prototype-context';
import { hapticLight } from '@/lib/haptics';
import { openSavedItem } from '@/lib/open-saved-item';
import {
  countSavedByFilter,
  filterSavedItems,
  resolveSavedItems,
  type SavedFilter,
} from '@/lib/resolve-saved-items';
import { TAB_SCREEN_BOTTOM_INSET } from '@/lib/tab-bar-layout';
import { fonts } from '@/lib/typography';

const savedThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    accentSoft: '#EDF8FC',
    activeText: '#303133',
    imageShade: 'rgba(34, 35, 37, 0.18)',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    accentSoft: '#1E2A33',
    activeText: '#303133',
    imageShade: 'rgba(15, 16, 17, 0.42)',
  },
} as const;

export default function SavedScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? savedThemes.dark : savedThemes.light;
  const { onScroll, contentTopPadding } = useGlobalHeader();
  const { bookmarks, toggleBookmark } = usePrototype();
  const { articles, programmes, opportunities, loading: contentLoading } = useContent();
  const { getItemById, loading: mediaLoading } = useMedia();
  const { play } = useMediaPlayer();
  const [activeFilter, setActiveFilter] = useState<SavedFilter>('all');

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

  const counts = useMemo(() => countSavedByFilter(savedItems), [savedItems]);
  const filteredItems = useMemo(
    () => filterSavedItems(savedItems, activeFilter),
    [activeFilter, savedItems]
  );

  const isLoading =
    bookmarks.size > 0 && (contentLoading || mediaLoading) && savedItems.length === 0;

  useEffect(() => {
    if (activeFilter !== 'all' && counts[activeFilter] === 0) {
      setActiveFilter('all');
    }
  }, [activeFilter, counts]);

  const subtitle =
    savedItems.length === 0
      ? 'Bookmark insights, programmes, media, and more for quick access.'
      : `${savedItems.length} saved item${savedItems.length === 1 ? '' : 's'}`;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentTopPadding, paddingBottom: TAB_SCREEN_BOTTOM_INSET + 72 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Text style={[styles.title, { color: colors.ink }]}>Saved</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>

        {savedItems.length > 0 ? (
          <SavedFilterChips
            active={activeFilter}
            onChange={(filter) => {
              hapticLight();
              setActiveFilter(filter);
            }}
            counts={counts}
            colors={{
              surface: colors.surface,
              ink: colors.ink,
              muted: colors.muted,
              border: colors.border,
              activeText: colors.activeText,
            }}
          />
        ) : null}

        {isLoading ? (
          <SavedListSkeleton
            colors={{
              surface: colors.surface,
              border: colors.border,
              surfaceAlt: colors.surfaceAlt,
            }}
          />
        ) : null}

        {!isLoading && savedItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
              <MaterialIcons name="bookmark-border" size={28} color={palette.green} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>Nothing saved yet</Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              Tap the bookmark icon on insights, programmes, media, and more to keep them here.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                hapticLight();
                router.push('/explore');
              }}
              style={({ pressed }) => [
                styles.emptyCta,
                { backgroundColor: palette.green, opacity: pressed ? 0.76 : 1 },
              ]}>
              <Text style={styles.emptyCtaText}>Browse Explore</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && savedItems.length > 0 && filteredItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="filter-list-off" size={24} color={palette.blue} />
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>No items in this filter</Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              Try another category or save more content from across the app.
            </Text>
          </View>
        ) : null}

        {filteredItems.map((item) => (
          <SavedItemCard
            key={item.key}
            item={item}
            colors={{
              surface: colors.surface,
              ink: colors.ink,
              muted: colors.muted,
              border: colors.border,
              accentSoft: colors.accentSoft,
              imageShade: colors.imageShade,
            }}
            onPress={() =>
              openSavedItem(item, {
                getMediaItem: getItemById,
                playMedia: play,
              })
            }
            onRemove={() => {
              hapticLight();
              toggleBookmark(item.key);
            }}
          />
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 38,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  emptyCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyCta: {
    marginTop: 8,
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCtaText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#303133',
  },
});
