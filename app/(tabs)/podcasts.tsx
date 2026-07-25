import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MediaItemCard, MediaListSkeleton } from '@/components/kcic/media-item-card';
import { MediaSegmentTabs, type MediaSegment } from '@/components/kcic/media-segment-tabs';
import { palette } from '@/components/kcic/ui';
import { useGlobalHeader } from '@/context/global-header-context';
import { useMedia } from '@/context/media-context';
import { useMediaPlayer } from '@/context/media-player-context';
import { usePrototype } from '@/context/prototype-context';
import { bookmarkKey } from '@/data/kcic';
import { hapticLight } from '@/lib/haptics';
import type { MediaItem } from '@/lib/media-api';
import { TAB_SCREEN_BOTTOM_INSET } from '@/lib/tab-bar-layout';
import { fonts } from '@/lib/typography';

const mediaThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    tabActive: palette.blue,
    imageShade: 'rgba(34, 35, 37, 0.18)',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    tabActive: palette.blue,
    imageShade: 'rgba(15, 16, 17, 0.42)',
  },
} as const;

export default function MediaScreen() {
  const { episode } = useLocalSearchParams<{ episode?: string }>();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? mediaThemes.dark : mediaThemes.light;
  const { onScroll, contentTopPadding } = useGlobalHeader();
  const { podcasts, videos, loading, refreshing, error, refresh } = useMedia();
  const { play } = useMediaPlayer();
  const { toggleBookmark, isBookmarked } = usePrototype();
  const [activeSegment, setActiveSegment] = useState<MediaSegment>('podcasts');

  const items = activeSegment === 'podcasts' ? podcasts : videos;

  useEffect(() => {
    if (!episode) return;
    const match = [...podcasts, ...videos].find((item) => item.id === episode);
    if (match) play(match);
  }, [episode, play, podcasts, videos]);

  const handleShare = async (item: MediaItem) => {
    hapticLight();
    await Share.share({
      title: item.title,
      message: `${item.title}\n\n${item.youtubeUrl}`,
    });
  };

  const emptyCopy = useMemo(() => {
    if (activeSegment === 'podcasts') {
      return 'No podcasts published yet. Check back soon for new KCIC conversations.';
    }
    return 'No videos published yet. Check back soon for new KCIC media.';
  }, [activeSegment]);

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
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={palette.green}
          />
        }>
        <MediaSegmentTabs
          active={activeSegment}
          onChange={(segment) => {
            hapticLight();
            setActiveSegment(segment);
          }}
          colors={{
            ink: colors.ink,
            muted: colors.muted,
            border: colors.border,
            tabActive: colors.tabActive,
          }}
        />

        {loading && items.length === 0 ? (
          <MediaListSkeleton
            colors={{
              surface: colors.surface,
              border: colors.border,
              surfaceAlt: colors.surfaceAlt,
            }}
          />
        ) : null}

        {error && items.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="cloud-off" size={24} color={palette.blue} />
            <Text style={[styles.stateTitle, { color: colors.ink }]}>Media unavailable</Text>
            <Text style={[styles.stateBody, { color: colors.muted }]}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void refresh()}
              style={({ pressed }) => [
                styles.retryButton,
                { backgroundColor: palette.green, opacity: pressed ? 0.76 : 1 },
              ]}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="play-circle-outline" size={24} color={palette.blue} />
            <Text style={[styles.stateTitle, { color: colors.ink }]}>Nothing here yet</Text>
            <Text style={[styles.stateBody, { color: colors.muted }]}>{emptyCopy}</Text>
          </View>
        ) : null}

        {items.map((item) => {
          const key = bookmarkKey('podcast', item.id);
          return (
            <MediaItemCard
              key={item.id}
              item={item}
              colors={{
                surface: colors.surface,
                ink: colors.ink,
                muted: colors.muted,
                border: colors.border,
                imageShade: colors.imageShade,
              }}
              saved={isBookmarked(key)}
              onPress={() => play(item)}
              onToggleSave={() => {
                hapticLight();
                toggleBookmark(key);
              }}
              onShare={() => void handleShare(item)}
            />
          );
        })}
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
  stateCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  stateTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  stateBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#303133',
  },
});
