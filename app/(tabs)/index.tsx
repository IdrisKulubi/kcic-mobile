import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { AppScreen, palette } from '@/components/kcic/ui';
import { useAuth } from '@/context/auth-context';
import { useContent } from '@/context/content-context';
import { useMedia } from '@/context/media-context';
import { usePrototype } from '@/context/prototype-context';
import { bookmarkKey, events } from '@/data/kcic';
import {
  formatContentDate,
  type NewsArticle,
  type Opportunity,
} from '@/lib/content-api';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import { openContent, openPodcastEpisode } from '@/lib/navigation';
import { fonts } from '@/lib/typography';

const forYouThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    accentSoft: '#E7F3DB',
    blueSoft: '#DDF5FB',
    brownSoft: '#FCEAE5',
    imageShade: 'rgba(27, 28, 30, 0.12)',
    activeText: '#303133',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    accentSoft: '#2A3822',
    blueSoft: '#17323A',
    brownSoft: '#3A2925',
    imageShade: 'rgba(12, 13, 14, 0.24)',
    activeText: '#303133',
  },
} as const;

const interestKeywords: Record<string, string[]> = {
  'AgTech Innovations': ['agri', 'farm', 'irrigation', 'food', 'soil', 'seed'],
  'Renewable Energy': ['energy', 'renewable', 'solar', 'carbon', 'power', 'grid'],
  'Circular Economy': ['circular', 'waste', 'recycling', 'materials'],
  'Climate Finance': ['finance', 'funding', 'investment', 'capital', 'grant'],
};

function articleHaystack(article: NewsArticle) {
  return `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
}

function matchingInterest(article: NewsArticle, interests: string[]) {
  const haystack = articleHaystack(article);
  return interests.find((interest) =>
    (interestKeywords[interest] ?? [interest.toLowerCase()]).some((keyword) =>
      haystack.includes(keyword.toLowerCase())
    )
  );
}

function recommendationScore(article: NewsArticle, interests: string[]) {
  const interestScore = matchingInterest(article, interests) ? 4 : 0;
  const featuredScore = article.featured ? 2 : 0;
  const publishedScore = Number.isNaN(new Date(article.publishedAt).valueOf())
    ? 0
    : new Date(article.publishedAt).valueOf() / 1e13;
  return interestScore + featuredScore + publishedScore;
}

function recommendationReason(article: NewsArticle, interests: string[]) {
  const interest = matchingInterest(article, interests);
  if (interest) return `Because you follow ${interest}`;
  if (article.featured) return 'Selected by KCIC editors';
  return 'Recommended for KCIC members';
}

function sortOpportunitiesByDeadline(items: Opportunity[]) {
  return [...items].sort((a, b) => {
    const aTime = a.deadline ? new Date(a.deadline).valueOf() : Number.POSITIVE_INFINITY;
    const bTime = b.deadline ? new Date(b.deadline).valueOf() : Number.POSITIVE_INFINITY;
    const safeA = Number.isNaN(aTime) ? Number.POSITIVE_INFINITY : aTime;
    const safeB = Number.isNaN(bTime) ? Number.POSITIVE_INFINITY : bTime;
    return safeA - safeB;
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getBriefDate() {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export default function ForYouScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? forYouThemes.dark : forYouThemes.light;
  const { user } = useAuth();
  const { articles, opportunities, loading, refreshing, error, refresh } = useContent();
  const { podcasts, videos } = useMedia();
  const {
    bookmarks,
    interests,
    toggleBookmark,
    isBookmarked,
    toggleRsvp,
    isRsvped,
  } = usePrototype();

  const rankedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => recommendationScore(b, interests) - recommendationScore(a, interests)
      ),
    [articles, interests]
  );
  const topPick = rankedArticles[0];
  const recommendedArticles = rankedArticles.slice(1, 4);
  const closingSoon = useMemo(
    () => sortOpportunitiesByDeadline(opportunities).slice(0, 2),
    [opportunities]
  );
  const upcomingEvent = events[0];
  const featuredPodcast = podcasts[0] ?? videos[0] ?? null;
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const topPickKey = topPick ? bookmarkKey('article', topPick.slug) : null;
  const hasNoLiveContent =
    !loading && !error && articles.length === 0 && opportunities.length === 0;

  const shareArticle = async (article: NewsArticle) => {
    hapticLight();
    await Share.share({
      title: article.title,
      message: `${article.title}\n\n${article.excerpt}`,
    });
  };

  return (
    <AppScreen
      backgroundColor={colors.background}
      refreshing={refreshing}
      onRefresh={() => void refresh()}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.briefHeader}>
        <View style={styles.briefMeta}>
          <View style={[styles.liveDot, { backgroundColor: palette.green }]} />
          <Text style={[styles.briefMetaText, { color: colors.muted }]}>
            Your climate brief · {getBriefDate()}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Personalize feed. Currently tuned to ${interests.length} interests`}
        onPress={() => {
          hapticLight();
          router.push('/profile');
        }}
        style={({ pressed }) => [
          styles.tuningRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.72 : 1,
          },
        ]}>
        <View style={[styles.tuningIcon, { backgroundColor: colors.accentSoft }]}>
          <MaterialIcons name="tune" size={17} color={palette.green} />
        </View>
        <View style={styles.tuningCopy}>
          <Text style={[styles.tuningTitle, { color: colors.ink }]}>Tuned for you</Text>
          <Text style={[styles.tuningDetail, { color: colors.muted }]} numberOfLines={1}>
            {interests.length > 0
              ? interests.slice(0, 2).join(' · ')
              : 'Choose topics to personalize your brief'}
          </Text>
        </View>
        <Text style={[styles.tuningAction, { color: colors.ink }]}>Edit</Text>
      </Pressable>

      {loading && articles.length === 0 && opportunities.length === 0 ? (
        <BriefSkeleton colors={colors} />
      ) : null}

      {error && articles.length === 0 && opportunities.length === 0 ? (
        <StatePanel
          icon="cloud-off"
          title="Your brief could not refresh"
          body={error}
          actionLabel="Try again"
          onAction={() => void refresh()}
          colors={colors}
        />
      ) : null}

      {hasNoLiveContent ? (
        <StatePanel
          icon="auto-awesome"
          title="Your brief is being prepared"
          body="New KCIC recommendations and opportunities will appear here as they are published."
          actionLabel="Refresh"
          onAction={() => void refresh()}
          colors={colors}
        />
      ) : null}

      {!loading && topPick ? (
        <View style={styles.section}>
          <SectionHeading title="Top pick for you" colors={colors} />
          <View
            style={[
              styles.leadStory,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Read ${topPick.title}`}
              onPress={() => {
                hapticLight();
                openContent('article', topPick.slug);
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}>
              <View style={styles.leadMedia}>
                <Image
                  source={{ uri: topPick.thumbnail }}
                  style={styles.leadImage}
                  contentFit="cover"
                />
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: colors.imageShade }]}
                />
                <View style={[styles.reasonBadge, { backgroundColor: colors.surface }]}>
                  <MaterialIcons name="auto-awesome" size={14} color={palette.green} />
                  <Text style={[styles.reasonText, { color: colors.ink }]} numberOfLines={1}>
                    {recommendationReason(topPick, interests)}
                  </Text>
                </View>
              </View>
              <View style={styles.leadBody}>
                <View style={styles.contentMeta}>
                  <View style={[styles.taxonomyDot, { backgroundColor: palette.blue }]} />
                  <Text style={[styles.contentMetaText, { color: colors.muted }]}>
                    {topPick.category}
                  </Text>
                  <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.contentMetaText, { color: colors.muted }]}>
                    {topPick.readTime ?? 'Read article'}
                  </Text>
                </View>
                <Text style={[styles.leadTitle, { color: colors.ink }]} numberOfLines={3}>
                  {topPick.title}
                </Text>
                <Text style={[styles.leadSummary, { color: colors.muted }]} numberOfLines={2}>
                  {topPick.excerpt}
                </Text>
              </View>
            </Pressable>
            <View style={[styles.leadFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.publishedDate, { color: colors.muted }]}>
                {formatContentDate(topPick.publishedAt)}
              </Text>
              <View style={styles.leadActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    topPickKey && isBookmarked(topPickKey)
                      ? 'Remove top pick from saved'
                      : 'Save top pick'
                  }
                  hitSlop={10}
                  onPress={() => {
                    if (!topPickKey) return;
                    hapticLight();
                    toggleBookmark(topPickKey);
                  }}
                  style={({ pressed }) => [
                    styles.iconAction,
                    { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.64 : 1 },
                  ]}>
                  <MaterialIcons
                    name={topPickKey && isBookmarked(topPickKey) ? 'bookmark' : 'bookmark-border'}
                    size={19}
                    color={topPickKey && isBookmarked(topPickKey) ? palette.green : colors.ink}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Share top pick"
                  hitSlop={10}
                  onPress={() => void shareArticle(topPick)}
                  style={({ pressed }) => [
                    styles.iconAction,
                    { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.64 : 1 },
                  ]}>
                  <MaterialIcons name="ios-share" size={18} color={colors.ink} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {!loading && closingSoon.length > 0 ? (
        <View style={styles.section}>
          <SectionHeading
            title="Closing soon"
            action="Explore all"
            onAction={() => router.push('/explore')}
            colors={colors}
          />
          <View style={[styles.groupedList, { backgroundColor: colors.surface }]}>
            {closingSoon.map((opportunity, index) => (
              <Pressable
                key={opportunity.id}
                accessibilityRole="button"
                accessibilityLabel={`View opportunity: ${opportunity.title}`}
                onPress={() => {
                  hapticLight();
                  openContent('opportunity', opportunity.slug);
                }}
                style={({ pressed }) => [
                  styles.opportunityRow,
                  index < closingSoon.length - 1
                    ? {
                        borderBottomColor: colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }
                    : null,
                  { opacity: pressed ? 0.66 : 1 },
                ]}>
                <View style={[styles.opportunityIcon, { backgroundColor: colors.brownSoft }]}>
                  <MaterialIcons name="schedule" size={18} color={palette.brown} />
                </View>
                <View style={styles.opportunityCopy}>
                  <Text style={[styles.opportunityType, { color: colors.muted }]}>
                    {opportunity.type}
                  </Text>
                  <Text style={[styles.opportunityTitle, { color: colors.ink }]} numberOfLines={2}>
                    {opportunity.title}
                  </Text>
                  <Text style={[styles.deadlineText, { color: palette.brown }]}>
                    {opportunity.deadline
                      ? `Deadline ${formatContentDate(opportunity.deadline)}`
                      : opportunity.location ?? 'Applications open'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={21} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {!loading && recommendedArticles.length > 0 ? (
        <View style={styles.section}>
          <SectionHeading
            title="Picked for your interests"
            action="More insights"
            onAction={() => router.push('/explore')}
            colors={colors}
          />
          <View style={[styles.groupedList, { backgroundColor: colors.surface }]}>
            {recommendedArticles.map((article, index) => {
              const key = bookmarkKey('article', article.slug);
              const saved = isBookmarked(key);
              return (
                <Pressable
                  key={article.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Read ${article.title}`}
                  onPress={() => {
                    hapticLight();
                    openContent('article', article.slug);
                  }}
                  style={({ pressed }) => [
                    styles.recommendationRow,
                    index < recommendedArticles.length - 1
                      ? {
                          borderBottomColor: colors.border,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        }
                      : null,
                    { opacity: pressed ? 0.68 : 1 },
                  ]}>
                  <Image
                    source={{ uri: article.thumbnail }}
                    style={styles.recommendationImage}
                    contentFit="cover"
                  />
                  <View style={styles.recommendationCopy}>
                    <Text style={[styles.recommendationReason, { color: colors.muted }]} numberOfLines={1}>
                      {recommendationReason(article, interests)}
                    </Text>
                    <Text style={[styles.recommendationTitle, { color: colors.ink }]} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={[styles.recommendationMeta, { color: colors.muted }]}>
                      {article.readTime ?? formatContentDate(article.publishedAt)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={saved ? 'Remove article from saved' : 'Save article'}
                    hitSlop={10}
                    onPress={(event) => {
                      event.stopPropagation();
                      hapticLight();
                      toggleBookmark(key);
                    }}>
                    <MaterialIcons
                      name={saved ? 'bookmark' : 'bookmark-border'}
                      size={20}
                      color={saved ? palette.green : colors.muted}
                    />
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeading
          title="Coming up"
          action="All events"
          onAction={() => router.push('/events')}
          colors={colors}
        />
        <View style={[styles.eventPanel, { backgroundColor: colors.blueSoft }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View event: ${upcomingEvent.title}`}
            onPress={() => {
              hapticLight();
              openContent('event', upcomingEvent.id);
            }}
            style={({ pressed }) => [styles.eventMain, { opacity: pressed ? 0.72 : 1 }]}>
            <View style={[styles.dateBlock, { backgroundColor: colors.surface }]}>
              <Text style={[styles.dateMonth, { color: palette.brown }]}>
                {upcomingEvent.date.split(',')[1]?.trim().split(' ')[0] ?? 'OCT'}
              </Text>
              <Text style={[styles.dateDay, { color: colors.ink }]}>
                {upcomingEvent.date.match(/\d+/)?.[0] ?? '13'}
              </Text>
            </View>
            <View style={styles.eventCopy}>
              <Text style={[styles.eventType, { color: colors.muted }]}>{upcomingEvent.type}</Text>
              <Text style={[styles.eventTitle, { color: colors.ink }]} numberOfLines={2}>
                {upcomingEvent.title}
              </Text>
              <View style={styles.eventMeta}>
                <MaterialIcons name="location-on" size={14} color={colors.muted} />
                <Text style={[styles.eventMetaText, { color: colors.muted }]} numberOfLines={1}>
                  {upcomingEvent.location}
                </Text>
              </View>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isRsvped(upcomingEvent.id) ? 'Remove event reminder' : 'Add event reminder'
            }
            onPress={() => {
              hapticMedium();
              toggleRsvp(upcomingEvent.id);
            }}
            style={({ pressed }) => [
              styles.reminderButton,
              {
                backgroundColor: isRsvped(upcomingEvent.id) ? palette.green : colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <MaterialIcons
              name={isRsvped(upcomingEvent.id) ? 'check' : 'notifications-none'}
              size={16}
              color={isRsvped(upcomingEvent.id) ? colors.activeText : colors.ink}
            />
            <Text
              style={[
                styles.reminderText,
                { color: isRsvped(upcomingEvent.id) ? colors.activeText : colors.ink },
              ]}>
              {isRsvped(upcomingEvent.id) ? 'Reminder set' : 'Remind me'}
            </Text>
          </Pressable>
        </View>
      </View>

      {featuredPodcast ? (
      <View style={styles.section}>
        <SectionHeading
          title="Listen on the go"
          action="Open Media"
          onAction={() => router.push('/podcasts')}
          colors={colors}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Play ${featuredPodcast.title}`}
          onPress={() => {
            hapticMedium();
            openPodcastEpisode(featuredPodcast.id);
          }}
          style={({ pressed }) => [
            styles.mediaStrip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.74 : 1,
            },
          ]}>
          <View style={styles.mediaImageWrap}>
            <Image
              source={{ uri: featuredPodcast.thumbnail }}
              style={styles.mediaImage}
              contentFit="cover"
            />
            <View style={styles.playDisc}>
              <MaterialIcons name="play-arrow" size={22} color={colors.activeText} />
            </View>
          </View>
          <View style={styles.mediaCopy}>
            <Text style={[styles.mediaLabel, { color: colors.muted }]}>
              {featuredPodcast.kind === 'podcast' ? 'Podcast' : 'Video'} ·{' '}
              {formatContentDate(featuredPodcast.publishedAt)}
            </Text>
            <Text style={[styles.mediaTitle, { color: colors.ink }]} numberOfLines={2}>
              {featuredPodcast.title}
            </Text>
            <Text style={[styles.mediaDuration, { color: colors.muted }]}>
              {featuredPodcast.duration || 'Watch now'}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={21} color={colors.muted} />
        </Pressable>
      </View>
      ) : null}

      {bookmarks.size === 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            hapticLight();
            router.push('/explore');
          }}
          style={({ pressed }) => [
            styles.discoveryPrompt,
            { borderColor: colors.border, opacity: pressed ? 0.68 : 1 },
          ]}>
          <MaterialIcons name="bookmark-add" size={19} color={palette.green} />
          <Text style={[styles.discoveryPromptText, { color: colors.muted }]}>
            Save useful reads and they will stay ready for you across the app.
          </Text>
          <MaterialIcons name="arrow-forward" size={17} color={colors.ink} />
        </Pressable>
      ) : null}
    </AppScreen>
  );
}

function SectionHeading({
  title,
  action,
  onAction,
  colors,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  colors: (typeof forYouThemes)[keyof typeof forYouThemes];
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            onAction();
          }}
          style={styles.sectionAction}>
          <Text style={[styles.sectionActionText, { color: colors.ink }]}>{action}</Text>
          <MaterialIcons name="arrow-forward" size={16} color={palette.green} />
        </Pressable>
      ) : null}
    </View>
  );
}

function BriefSkeleton({
  colors,
}: {
  colors: (typeof forYouThemes)[keyof typeof forYouThemes];
}) {
  return (
    <View style={styles.skeletonGroup} accessibilityLabel="Loading your climate brief">
      <View style={[styles.skeletonLead, { backgroundColor: colors.surface }]}>
        <View style={[styles.skeletonMedia, { backgroundColor: colors.surfaceAlt }]} />
        <View style={styles.skeletonBody}>
          <View style={[styles.skeletonShort, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.skeletonLong, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.skeletonMedium, { backgroundColor: colors.surfaceAlt }]} />
        </View>
      </View>
      <View style={[styles.skeletonRow, { backgroundColor: colors.surface }]}>
        <View style={[styles.skeletonIcon, { backgroundColor: colors.surfaceAlt }]} />
        <View style={styles.skeletonRowCopy}>
          <View style={[styles.skeletonShort, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.skeletonLong, { backgroundColor: colors.surfaceAlt }]} />
        </View>
      </View>
    </View>
  );
}

function StatePanel({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  colors,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  colors: (typeof forYouThemes)[keyof typeof forYouThemes];
}) {
  return (
    <View style={[styles.statePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.stateIcon, { backgroundColor: colors.blueSoft }]}>
        <MaterialIcons name={icon} size={23} color={palette.blue} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.stateBody, { color: colors.muted }]}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          hapticMedium();
          onAction();
        }}
        style={({ pressed }) => [
          styles.stateAction,
          { backgroundColor: palette.green, opacity: pressed ? 0.72 : 1 },
        ]}>
        <Text style={[styles.stateActionText, { color: colors.activeText }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  briefHeader: {
    marginBottom: 18,
  },
  greeting: {
    fontFamily: fonts.extraBold,
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.55,
  },
  briefMeta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  briefMetaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  tuningRow: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  tuningIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tuningCopy: {
    minWidth: 0,
    flex: 1,
  },
  tuningTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  tuningDetail: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  tuningAction: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  section: {
    marginTop: 28,
  },
  sectionHeading: {
    minHeight: 30,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.28,
  },
  sectionAction: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionActionText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  leadStory: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
  },
  leadMedia: {
    height: 174,
    overflow: 'hidden',
  },
  leadImage: {
    width: '100%',
    height: '100%',
  },
  reasonBadge: {
    position: 'absolute',
    left: 13,
    right: 13,
    bottom: 12,
    alignSelf: 'flex-start',
    maxWidth: '86%',
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  reasonText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  leadBody: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 15,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  taxonomyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  contentMetaText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  leadTitle: {
    marginTop: 10,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.22,
  },
  leadSummary: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  leadFooter: {
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  publishedDate: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  leadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupedList: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  opportunityRow: {
    minHeight: 106,
    paddingHorizontal: 13,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  opportunityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opportunityCopy: {
    minWidth: 0,
    flex: 1,
  },
  opportunityType: {
    marginBottom: 4,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  opportunityTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  deadlineText: {
    marginTop: 6,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  recommendationRow: {
    minHeight: 104,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  recommendationImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  recommendationCopy: {
    minWidth: 0,
    flex: 1,
  },
  recommendationReason: {
    marginBottom: 4,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  recommendationTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationMeta: {
    marginTop: 5,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  eventPanel: {
    overflow: 'hidden',
    borderRadius: 16,
    padding: 13,
  },
  eventMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBlock: {
    width: 56,
    height: 62,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  dateDay: {
    marginTop: 1,
    fontFamily: fonts.extraBold,
    fontSize: 22,
    lineHeight: 26,
  },
  eventCopy: {
    minWidth: 0,
    flex: 1,
  },
  eventType: {
    marginBottom: 4,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  eventTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  eventMeta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  reminderButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    marginTop: 13,
    marginLeft: 68,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reminderText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  mediaStrip: {
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mediaImageWrap: {
    width: 76,
    height: 72,
    borderRadius: 11,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    ...StyleSheet.absoluteFillObject,
  },
  playDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaCopy: {
    minWidth: 0,
    flex: 1,
  },
  mediaLabel: {
    marginBottom: 4,
    fontFamily: fonts.medium,
    fontSize: 9,
  },
  mediaTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  mediaDuration: {
    marginTop: 5,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  discoveryPrompt: {
    minHeight: 58,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discoveryPromptText: {
    minWidth: 0,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  skeletonGroup: {
    gap: 12,
    marginTop: 28,
  },
  skeletonLead: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  skeletonMedia: {
    height: 174,
  },
  skeletonBody: {
    padding: 17,
    gap: 11,
  },
  skeletonShort: {
    width: '31%',
    height: 9,
    borderRadius: 5,
  },
  skeletonLong: {
    width: '92%',
    height: 15,
    borderRadius: 6,
  },
  skeletonMedium: {
    width: '67%',
    height: 11,
    borderRadius: 6,
  },
  skeletonRow: {
    minHeight: 94,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  skeletonRowCopy: {
    flex: 1,
    gap: 10,
  },
  statePanel: {
    marginTop: 28,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: 'center',
  },
  stateIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginBottom: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateBody: {
    maxWidth: 320,
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  stateAction: {
    minHeight: 40,
    marginTop: 17,
    borderRadius: 10,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateActionText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
