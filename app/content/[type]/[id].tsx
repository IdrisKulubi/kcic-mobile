import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showRsvpSuccess } from '@/components/kcic/feedback';
import { PrimaryButton, palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import {
  bookmarkKey,
  getArticle,
  getEvent,
  getStory,
  type ContentType,
} from '@/data/kcic';

export default function ContentDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const contentType = type as ContentType;
  const { toggleBookmark, isBookmarked, toggleRsvp, isRsvped } = usePrototype();

  const article = contentType === 'article' ? getArticle(id) : undefined;
  const story = contentType === 'story' ? getStory(id) : undefined;
  const event = contentType === 'event' ? getEvent(id) : undefined;

  const item = article ?? story ?? event;

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Content not found.</Text>
      </SafeAreaView>
    );
  }

  const bKey = bookmarkKey(contentType, id);
  const bookmarked = isBookmarked(bKey);
  const rsvped = contentType === 'event' ? isRsvped(id) : false;

  const title = 'title' in item ? item.title : '';
  const summary = 'summary' in item ? item.summary : '';
  const image = item.image;

  const meta =
    contentType === 'article' && article
      ? `${article.category} · ${article.date} · ${article.readTime}`
      : contentType === 'story' && story
        ? `${story.sector} · ${story.founder} · ${story.location}`
        : contentType === 'event' && event
          ? `${event.type} · ${event.date} · ${event.time}`
          : '';

  const handleShare = async () => {
    await Share.share({ message: `${title}\n\n${summary}`, title });
  };

  const handleRsvp = () => {
    if (contentType !== 'event' || !event) return;
    const added = toggleRsvp(id);
    showRsvpSuccess(event.title, added);
  };

  const screenTitle =
    contentType === 'article' ? 'Insight' : contentType === 'story' ? 'SME Story' : 'Event';

  return (
    <>
      <Stack.Screen options={{ title: screenTitle, headerBackVisible: false }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Image source={{ uri: image }} style={styles.hero} contentFit="cover" />
        <View style={styles.body}>
          <Text style={styles.meta}>{meta}</Text>
          <Text style={styles.title}>{title}</Text>
          {contentType === 'story' && story ? (
            <View style={styles.impactBadge}>
              <MaterialIcons name="bolt" size={14} color={palette.blue} />
              <Text style={styles.impactText}>{story.impact}</Text>
            </View>
          ) : null}
          {contentType === 'event' && event ? (
            <Text style={styles.location}>{event.location}</Text>
          ) : null}
          <Text style={styles.summary}>{summary}</Text>

          <View style={styles.actions}>
            <PrimaryButton
              label={bookmarked ? 'Saved' : 'Save'}
              icon={bookmarked ? 'bookmark' : 'bookmark-border'}
              variant="outline"
              onPress={() => toggleBookmark(bKey)}
            />
            <PrimaryButton label="Share" icon="share" variant="outline" onPress={handleShare} />
          </View>

          {contentType === 'event' && event ? (
            <PrimaryButton
              label={rsvped ? "You're interested" : "I'm Interested"}
              onPress={handleRsvp}
            />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  scroll: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    width: '100%',
    height: 240,
  },
  body: {
    padding: 20,
    gap: 12,
  },
  meta: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  impactBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF8FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  impactText: {
    color: palette.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  location: {
    color: palette.slate,
    fontSize: 15,
    fontWeight: '700',
  },
  summary: {
    color: palette.slate,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  error: {
    padding: 24,
    color: palette.slate,
    fontSize: 16,
  },
});
