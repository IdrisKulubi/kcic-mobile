import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { showOpenResource } from '@/components/kcic/feedback';
import { AppScreen, Card, PrimaryButton, SectionTitle, palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { resolveBookmark, type BookmarkType } from '@/data/kcic';
import { useContent } from '@/context/content-context';
import { useMedia } from '@/context/media-context';
import { openContent, openPodcastEpisode } from '@/lib/navigation';

type SavedType = BookmarkType | 'programme' | 'opportunity';

function bookmarkTypeLabel(type: SavedType) {
  if (type === 'article') return 'Insight';
  if (type === 'programme') return 'Programme';
  if (type === 'opportunity') return 'Opportunity';
  if (type === 'story') return 'Story';
  if (type === 'event') return 'Event';
  if (type === 'podcast') return 'Media';
  return 'Resource';
}

export default function SavedScreen() {
  const router = useRouter();
  const { bookmarks, toggleBookmark } = usePrototype();
  const { articles, programmes, opportunities } = useContent();
  const { getItemById } = useMedia();

  const savedItems = useMemo(
    () =>
      Array.from(bookmarks)
        .map((key) => {
          if (key.startsWith('podcast:')) {
            const id = key.slice('podcast:'.length);
            const mediaItem = getItemById(id);
            if (mediaItem) {
              return {
                key,
                type: 'podcast' as const,
                id,
                title: mediaItem.title,
                subtitle: mediaItem.kind === 'podcast' ? 'Podcast' : 'Video',
                icon: 'podcasts' as const,
              };
            }
          }
          if (key.startsWith('article:programme:')) {
            const slug = key.slice('article:programme:'.length);
            const item = programmes.find((programme) => programme.slug === slug);
            return item
              ? { key, type: 'programme' as const, id: slug, title: item.title, subtitle: item.category, icon: 'account-balance' as const }
              : null;
          }
          if (key.startsWith('article:opportunity:')) {
            const slug = key.slice('article:opportunity:'.length);
            const item = opportunities.find((opportunity) => opportunity.slug === slug);
            return item
              ? { key, type: 'opportunity' as const, id: slug, title: item.title, subtitle: item.type, icon: 'work-outline' as const }
              : null;
          }
          if (key.startsWith('article:')) {
            const slug = key.slice('article:'.length);
            const item = articles.find((article) => article.slug === slug);
            if (item) {
              return {
                key,
                type: 'article' as const,
                id: slug,
                title: item.title,
                subtitle: item.category,
                icon: 'article' as const,
              };
            }
          }
          return resolveBookmark(key);
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [articles, bookmarks, getItemById, opportunities, programmes]
  );

  const handleOpen = (type: SavedType, id: string, title: string, detail: string) => {
    if (type === 'resource') {
      showOpenResource(title, detail);
      return;
    }

    if (type === 'podcast') {
      openPodcastEpisode(id);
      return;
    }

    openContent(type, id);
  };

  return (
    <AppScreen>
      <Text style={styles.eyebrow}>Your collection</Text>
      <Text style={styles.title}>Saved</Text>
      <Text style={styles.intro}>
        Articles, stories, events, and resources you bookmark across KCIC Climate Hub.
      </Text>

      {savedItems.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="bookmark-border" size={28} color={palette.green} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>
            Tap the bookmark icon on insights, stories, events, or resources to keep them here for quick
            access.
          </Text>
          <PrimaryButton label="Browse Library" onPress={() => router.push('/library')} />
        </Card>
      ) : (
        <Card style={styles.listCard}>
          <SectionTitle title={`${savedItems.length} saved item${savedItems.length === 1 ? '' : 's'}`} />
          {savedItems.map((item) => (
            <Pressable
              key={item.key}
              style={styles.savedRow}
              onPress={() => handleOpen(item.type, item.id, item.title, item.subtitle)}
              accessibilityRole="button">
              <View style={styles.savedIcon}>
                <MaterialIcons name={item.icon} size={22} color={palette.blue} />
              </View>
              <View style={styles.savedText}>
                <Text style={styles.savedType}>{bookmarkTypeLabel(item.type)}</Text>
                <Text style={styles.savedTitle}>{item.title}</Text>
                <Text style={styles.savedSubtitle}>{item.subtitle}</Text>
              </View>
              <Pressable
                onPress={() => toggleBookmark(item.key)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from saved`}>
                <MaterialIcons name="bookmark" size={22} color={palette.green} />
              </Pressable>
            </Pressable>
          ))}
        </Card>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '900',
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
    marginBottom: 22,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F7DE',
    marginBottom: 4,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyBody: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 8,
  },
  listCard: {
    gap: 4,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
  savedIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF8FC',
  },
  savedText: {
    flex: 1,
    gap: 2,
  },
  savedType: {
    color: palette.limeDark,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  savedTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  savedSubtitle: {
    color: palette.slate,
    fontSize: 12,
    lineHeight: 18,
  },
});
