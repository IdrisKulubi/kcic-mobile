import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer, { type YoutubeIframeRef } from 'react-native-youtube-iframe';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

import { palette } from '@/components/kcic/ui';
import type { MediaItem } from '@/lib/media-api';
import { fonts } from '@/lib/typography';
import { hapticLight } from '@/lib/haptics';

type MediaPlayerContextValue = {
  activeItem: MediaItem | null;
  isExpanded: boolean;
  isPlaying: boolean;
  play: (item: MediaItem) => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
  togglePlay: () => void;
};

const MediaPlayerContext = createContext<MediaPlayerContextValue | null>(null);

const playerThemes = {
  light: {
    surface: '#FFFFFF',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    overlay: 'rgba(15, 16, 17, 0.55)',
  },
  dark: {
    surface: '#202123',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    overlay: 'rgba(0, 0, 0, 0.72)',
  },
} as const;

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? playerThemes.dark : playerThemes.light;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const playerRef = useRef<YoutubeIframeRef>(null);

  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((item: MediaItem) => {
    hapticLight();
    setActiveItem(item);
    setIsExpanded(true);
    setIsPlaying(true);
    void activateKeepAwakeAsync('kcic-media-player');
  }, []);

  const close = useCallback(() => {
    setActiveItem(null);
    setIsExpanded(false);
    setIsPlaying(false);
    deactivateKeepAwake('kcic-media-player');
  }, []);

  const expand = useCallback(() => {
    hapticLight();
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    hapticLight();
    setIsExpanded(false);
  }, []);

  const togglePlay = useCallback(() => {
    hapticLight();
    setIsPlaying((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      activeItem,
      isExpanded,
      isPlaying,
      play,
      close,
      expand,
      collapse,
      togglePlay,
    }),
    [activeItem, isExpanded, isPlaying, play, close, expand, collapse, togglePlay]
  );

  const playerHeight = Math.round((width * 9) / 16);

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}

      {activeItem && !isExpanded ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Resume ${activeItem.title}`}
          onPress={expand}
          style={[
            styles.miniPlayer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              bottom: insets.bottom + 88,
            },
          ]}>
          <Image source={{ uri: activeItem.thumbnail }} style={styles.miniThumb} contentFit="cover" />
          <View style={styles.miniCopy}>
            <Text style={[styles.miniTitle, { color: colors.ink }]} numberOfLines={1}>
              {activeItem.title}
            </Text>
            <Text style={[styles.miniMeta, { color: colors.muted }]} numberOfLines={1}>
              {activeItem.duration || 'KCIC Media'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              togglePlay();
            }}>
            <MaterialIcons
              name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={30}
              color={palette.blue}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close player"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              close();
            }}>
            <MaterialIcons name="close" size={22} color={colors.muted} />
          </Pressable>
        </Pressable>
      ) : null}

      <Modal
        visible={Boolean(activeItem && isExpanded)}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={collapse}>
        {activeItem ? (
          <View style={[styles.modalRoot, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Minimize player"
                hitSlop={8}
                onPress={collapse}>
                <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.ink} />
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.ink }]} numberOfLines={1}>
                Now playing
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close player"
                hitSlop={8}
                onPress={close}>
                <MaterialIcons name="close" size={24} color={colors.ink} />
              </Pressable>
            </View>

            <YoutubePlayer
              ref={playerRef}
              height={playerHeight}
              width={width}
              play={isPlaying}
              videoId={activeItem.id}
              webViewProps={{
                androidLayerType: 'hardware',
              }}
              onChangeState={(state: string) => {
                if (state === 'ended') {
                  setIsPlaying(false);
                  deactivateKeepAwake('kcic-media-player');
                }
                if (state === 'playing') {
                  setIsPlaying(true);
                  void activateKeepAwakeAsync('kcic-media-player');
                }
                if (state === 'paused') {
                  setIsPlaying(false);
                }
              }}
            />

            <View style={styles.modalBody}>
              <Text style={[styles.expandedTitle, { color: colors.ink }]}>{activeItem.title}</Text>
              <Text style={[styles.expandedSummary, { color: colors.muted }]}>
                {activeItem.summary}
              </Text>
            </View>
          </View>
        ) : null}
      </Modal>
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within MediaPlayerProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 18,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  miniThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
  },
  miniCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  miniTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  miniMeta: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 10,
  },
  expandedTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  expandedSummary: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
});
