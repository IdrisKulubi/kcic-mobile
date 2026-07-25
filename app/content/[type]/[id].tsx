import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showRsvpSuccess } from '@/components/kcic/feedback';
import { ArticleDetailScreen } from '@/components/kcic/article-detail-screen';
import { ArticleDetailSkeleton } from '@/components/kcic/article-detail-skeleton';
import { PrimaryButton, palette } from '@/components/kcic/ui';
import { ContentMessage, ContentSkeleton } from '@/components/kcic/content-state';
import { RichText } from '@/components/kcic/rich-text';
import { usePrototype } from '@/context/prototype-context';
import {
  fetchContentDetail,
  formatContentDate,
  getProgrammeImage,
  resolveContentImageUrl,
  type NewsArticle,
  type Opportunity,
  type Programme,
} from '@/lib/content-api';
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

  if (type === 'article' || type === 'programme' || type === 'opportunity') {
    return <LiveContentDetail type={type} slugOrId={id} />;
  }

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

function LiveContentDetail({
  type,
  slugOrId,
}: {
  type: 'article' | 'programme' | 'opportunity';
  slugOrId: string;
}) {
  const { toggleBookmark, isBookmarked } = usePrototype();
  const [item, setItem] = useState<NewsArticle | Programme | Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchContentDetail(type, slugOrId)
      .then((response) => {
        if (!active) return;
        setItem(response.item);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('This content could not be loaded. Check your connection and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slugOrId, type]);

  if (loading) {
    if (type === 'article') {
      return (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <ArticleDetailSkeleton />
        </>
      );
    }

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.stateBody}>
          <ContentSkeleton rows={3} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item || error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.stateBody}>
          <ContentMessage title="Content unavailable" body={error ?? 'This item is no longer available.'} />
        </View>
      </SafeAreaView>
    );
  }

  const article = type === 'article' ? (item as NewsArticle) : null;
  const programme = type === 'programme' ? (item as Programme) : null;
  const opportunity = type === 'opportunity' ? (item as Opportunity) : null;
  const bookmark = bookmarkKey(
    'article',
    type === 'article' ? slugOrId : `${type}:${slugOrId}`
  );
  const bookmarked = isBookmarked(bookmark);
  const title = item.title;

  if (article) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ArticleDetailScreen
          article={article}
          bookmarked={bookmarked}
          onToggleBookmark={() => toggleBookmark(bookmark)}
        />
      </>
    );
  }

  const summary = programme?.description ?? opportunity?.summary ?? '';
  const image = programme ? getProgrammeImage(programme) : undefined;
  const meta = programme
    ? programme.category
    : [opportunity?.type, opportunity?.location, formatContentDate(opportunity?.deadline ?? null)]
        .filter(Boolean)
        .join(' · ');

  return (
    <>
      <Stack.Screen
        options={{
          title: type === 'programme' ? 'Programme' : 'Opportunity',
          headerBackVisible: false,
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {image ? <Image source={{ uri: image }} style={styles.hero} contentFit="cover" /> : null}
        <View style={styles.body}>
          <Text style={styles.meta}>{meta}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{summary}</Text>

          <View style={styles.actions}>
            <PrimaryButton
              label={bookmarked ? 'Saved' : 'Save'}
              icon={bookmarked ? 'bookmark' : 'bookmark-border'}
              variant="outline"
              onPress={() => toggleBookmark(bookmark)}
            />
            <PrimaryButton
              label="Share"
              icon="share"
              variant="outline"
              onPress={() => void Share.share({ title, message: `${title}\n\n${summary}` })}
            />
          </View>

          {programme ? (
            <>
              <RichSection title="Introduction" html={programme.introduction} />
              <RichSection title="Application process" html={programme.applicationProcess} />
              <RichSection title="Eligibility" html={programme.eligibility} />
              <RichSection title="Selection" html={programme.applicationSelection} />
              <RichSection title="Technical support" html={programme.technicalSupport} />
              {programme.sponsors?.length ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailHeading}>Programme sponsors</Text>
                  {programme.sponsors.map((sponsor) => (
                    <View key={sponsor.id} style={styles.sponsorRow}>
                      <Image
                        source={{ uri: resolveContentImageUrl(sponsor.logo) }}
                        style={styles.sponsorLogo}
                        contentFit="contain"
                      />
                      <Text style={styles.sponsorName}>{sponsor.name}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {programme.applicationLink ? (
                <PrimaryButton
                  label="Open application"
                  onPress={() => void Linking.openURL(programme.applicationLink!)}
                />
              ) : null}
            </>
          ) : null}

          {opportunity ? (
            <>
              <RichSection title="Description" html={opportunity.description} />
              <RichSection title="Responsibilities" html={opportunity.responsibilities} />
              <RichSection title="Requirements" html={opportunity.requirements} />
              <RichSection title="Qualifications" html={opportunity.qualifications} />
              <RichSection title="How to apply" html={opportunity.applicationInstructions} />
              {opportunity.attachments?.length ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailHeading}>Attachments</Text>
                  {opportunity.attachments.map((attachment) => (
                    <Pressable
                      key={attachment.id}
                      style={styles.attachmentRow}
                      onPress={() => void Linking.openURL(attachment.fileUrl)}>
                      <MaterialIcons name="description" size={20} color={palette.blue} />
                      <Text style={styles.attachmentName}>{attachment.fileName}</Text>
                      <MaterialIcons name="open-in-new" size={18} color={palette.slate} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {opportunity.applicationLink ? (
                <PrimaryButton
                  label="Apply online"
                  onPress={() => void Linking.openURL(opportunity.applicationLink!)}
                />
              ) : opportunity.applicationEmail ? (
                <PrimaryButton
                  label="Email application"
                  onPress={() => void Linking.openURL(`mailto:${opportunity.applicationEmail}`)}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function RichSection({ title, html }: { title: string; html: string | null }) {
  if (!html) return null;
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailHeading}>{title}</Text>
      <RichText html={html} />
    </View>
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
  stateBody: {
    padding: 20,
  },
  detailSection: {
    gap: 10,
    marginTop: 14,
  },
  detailHeading: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  sponsorLogo: {
    width: 44,
    height: 36,
  },
  sponsorName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  attachmentRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
  },
  attachmentName: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
});
