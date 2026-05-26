import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, Pill, TopBar, palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { getPodcast, podcasts, type Podcast } from '@/data/kcic';

export default function PodcastsScreen() {
  const router = useRouter();
  const { episode } = useLocalSearchParams<{ episode?: string }>();
  const { hasUnreadNotifications } = usePrototype();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast>(podcasts[0]);

  useEffect(() => {
    if (episode) {
      const match = getPodcast(episode);
      if (match) setSelectedPodcast(match);
    }
  }, [episode]);

  const selectPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };

  const playSelectedPodcast = async () => {
    await WebBrowser.openBrowserAsync(selectedPodcast.youtubeUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  return (
    <AppScreen>
      <TopBar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <Text style={styles.eyebrow}>Listen & Watch</Text>
      <Text style={styles.title}>Podcasts</Text>
      <Text style={styles.intro}>
        Access the latest KCIC conversations with founders, ecosystem partners, and climate
        innovation leaders.
      </Text>

      <Card style={styles.playerCard}>
        <Pressable style={styles.playerFrame} onPress={playSelectedPodcast}>
          <Image
            source={{ uri: selectedPodcast.thumbnail }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <View style={styles.playerShade} />
          <View style={styles.playerButton}>
            <MaterialIcons name="play-arrow" size={42} color={palette.white} />
          </View>
          <Text style={styles.playerHint}>Tap to play in app</Text>
        </Pressable>
        <View style={styles.nowPlaying}>
          <Pill label={selectedPodcast.publishedLabel} active />
          <Text style={styles.nowTitle}>{selectedPodcast.title}</Text>
          <Text style={styles.nowSummary}>{selectedPodcast.summary}</Text>
        </View>
      </Card>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Latest Episodes</Text>
        <Text style={styles.listCount}>{podcasts.length} videos</Text>
      </View>

      {podcasts.map((podcast) => {
        const isSelected = podcast.id === selectedPodcast.id;

        return (
          <Pressable key={podcast.id} onPress={() => selectPodcast(podcast)}>
            <Card style={[styles.episodeCard, isSelected ? styles.episodeCardActive : null]}>
              <Image source={{ uri: podcast.thumbnail }} style={styles.thumbnail} contentFit="cover" />
              <View style={styles.episodeBody}>
                <View style={styles.episodeMeta}>
                  <Text style={styles.episodeLabel}>{podcast.publishedLabel}</Text>
                  <View style={styles.durationPill}>
                    <MaterialIcons
                      name={isSelected ? 'pause-circle-filled' : 'play-circle-filled'}
                      size={16}
                      color={isSelected ? palette.limeDark : palette.blue}
                    />
                    <Text style={styles.durationText}>{isSelected ? 'Now playing' : podcast.duration}</Text>
                  </View>
                </View>
                <Text style={styles.episodeTitle}>{podcast.title}</Text>
                <Text style={styles.episodeSummary} numberOfLines={3}>
                  {podcast.summary}
                </Text>
              </View>
            </Card>
          </Pressable>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    marginTop: 8,
  },
  intro: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 20,
  },
  playerCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  playerFrame: {
    height: 214,
    backgroundColor: '#08140F',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  playerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 28, 22, 0.34)',
  },
  playerButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.lime,
    elevation: 4,
  },
  playerHint: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    color: palette.white,
    fontSize: 13,
    fontWeight: '900',
  },
  nowPlaying: {
    padding: 18,
    gap: 10,
  },
  nowTitle: {
    color: palette.ink,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  nowSummary: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  listTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  listCount: {
    color: palette.limeDark,
    fontSize: 13,
    fontWeight: '900',
  },
  episodeCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    marginBottom: 14,
  },
  episodeCardActive: {
    borderColor: palette.lime,
    backgroundColor: '#FBFFF7',
  },
  thumbnail: {
    width: 112,
    height: 92,
    borderRadius: 10,
    backgroundColor: palette.panel,
  },
  episodeBody: {
    flex: 1,
    gap: 7,
  },
  episodeMeta: {
    gap: 7,
  },
  episodeLabel: {
    color: palette.forest,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  durationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: '#EEF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  episodeTitle: {
    color: palette.ink,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  episodeSummary: {
    color: palette.slate,
    fontSize: 12,
    lineHeight: 17,
  },
});
