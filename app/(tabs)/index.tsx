import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openContent, openPodcastEpisode } from '@/lib/navigation';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppScreen,
  Card,
  ImageHeader,
  Pill,
  PrimaryButton,
  SearchField,
  SectionTitle,
  TopBar,
  palette,
} from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import {
  events,
  homeCategoryFilters,
  podcasts,
} from '@/data/kcic';
import { ContentMessage, ContentSkeleton } from '@/components/kcic/content-state';
import { useContent } from '@/context/content-context';
import { formatContentDate } from '@/lib/content-api';

export default function HomeScreen() {
  const router = useRouter();
  const { hasUnreadNotifications } = usePrototype();
  const { articles, opportunities, loading, refreshing, error, refresh } = useContent();
  const [activeFilter, setActiveFilter] = useState(homeCategoryFilters[0].value);

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') return articles;
    const filter = homeCategoryFilters.find((item) => item.value === activeFilter);
    if (!filter || !('categories' in filter)) return articles;
    return articles.filter((article) => filter.categories?.includes(article.category));
  }, [activeFilter, articles]);
  const featured = filteredArticles.find((article) => article.featured) ?? filteredArticles[0] ?? articles[0];
  const insightArticles = filteredArticles.slice(1, 3);
  const upcoming = events[0];
  const featuredOpportunity =
    opportunities.find((opportunity) => opportunity.isFeatured) ?? opportunities[0];

  return (
    <AppScreen refreshing={refreshing} onRefresh={() => void refresh()}>
      <TopBar
        showProfileAvatar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <View style={styles.hero}>
        <Text style={styles.greeting}>Good morning, Idris</Text>
        <Text style={styles.subtitle}>Today in Climate Innovation</Text>
      </View>

      <SearchField placeholder="Search reports, news, policies..." onPress={() => router.push('/search')} />

      <View style={styles.pillRow}>
        {homeCategoryFilters.map((filter, index) => (
          <Pill
            key={filter.value}
            label={filter.label}
            active={activeFilter === filter.value}
            tone={index === 2 ? 'blue' : 'green'}
            onPress={() => setActiveFilter(filter.value)}
          />
        ))}
      </View>

      {loading && articles.length === 0 ? <ContentSkeleton rows={3} /> : null}
      {error && articles.length === 0 ? (
        <ContentMessage title="Live content is unavailable" body={error} onRetry={() => void refresh()} />
      ) : null}
      {!loading && !error && articles.length === 0 ? (
        <ContentMessage
          title="No insights published yet"
          body="Published KCIC reports and news will appear here."
        />
      ) : null}

      {featured ? (
        <Card style={styles.featuredCard} onPress={() => openContent('article', featured.slug)}>
          <ImageHeader source={featured.thumbnail} height={232}>
            <View style={styles.featuredCopy}>
              <Pill label={featured.featured ? 'Featured' : featured.category} tone="blue" />
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredSummary} numberOfLines={2}>
                {featured.excerpt}
              </Text>
            </View>
          </ImageHeader>
        </Card>
      ) : null}

      {insightArticles.length > 0 ? (
        <Card style={styles.sectionCard}>
          <SectionTitle title="Latest Insights" />
          {insightArticles.map((article) => (
            <Pressable
              key={article.id}
              style={styles.insightRow}
              onPress={() => openContent('article', article.slug)}>
              <Image source={{ uri: article.thumbnail }} style={styles.insightImage} contentFit="cover" />
              <View style={styles.insightText}>
                <Text style={styles.category}>{article.category}</Text>
                <Text style={styles.insightTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.meta}>{formatContentDate(article.publishedAt)}</Text>
              </View>
            </Pressable>
          ))}
        </Card>
      ) : null}

      <Card style={styles.sectionCard}>
        <SectionTitle title="Upcoming Events" icon="calendar-month" />
        <Pressable style={styles.eventMini} onPress={() => openContent('event', upcoming.id)}>
          <View style={styles.dateBadge}>
            <Text style={styles.month}>OCT</Text>
            <Text style={styles.day}>13</Text>
          </View>
          <View style={styles.eventText}>
            <Text style={styles.eventTitle}>{upcoming.title}</Text>
            <Text style={styles.meta}>{upcoming.location}</Text>
          </View>
        </Pressable>
      </Card>

      <Card style={styles.sectionCard}>
        <SectionTitle
          title="Latest Podcasts"
          action="View All"
          icon="play-circle-outline"
          onPressAction={() => router.push('/podcasts')}
        />
        {podcasts.slice(0, 2).map((podcast) => (
          <Pressable
            key={podcast.id}
            onPress={() => openPodcastEpisode(podcast.id)}>
            <View style={styles.podcastRow}>
              <Image source={{ uri: podcast.thumbnail }} style={styles.podcastImage} contentFit="cover" />
              <View style={styles.podcastText}>
                <Text style={styles.podcastLabel}>{podcast.publishedLabel}</Text>
                <Text style={styles.podcastTitle} numberOfLines={2}>
                  {podcast.title}
                </Text>
                <View style={styles.podcastMeta}>
                  <MaterialIcons name="play-circle-filled" size={16} color={palette.limeDark} />
                  <Text style={styles.meta}>{podcast.duration}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </Card>

      {featuredOpportunity ? (
        <View style={styles.grantCard}>
          <View style={styles.grantBadge}>
            <Text style={styles.grantBadgeText}>
              {featuredOpportunity.deadline
                ? `Deadline ${formatContentDate(featuredOpportunity.deadline)}`
                : featuredOpportunity.type}
            </Text>
          </View>
          <MaterialIcons name="payments" size={24} color={palette.white} style={styles.grantIcon} />
          <Text style={styles.grantTitle}>{featuredOpportunity.title}</Text>
          <Text style={styles.grantSummary}>{featuredOpportunity.summary}</Text>
          <PrimaryButton
            label="View opportunity"
            variant="outline"
            onPress={() => openContent('opportunity', featuredOpportunity.slug)}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 16,
  },
  greeting: {
    color: palette.ink,
    fontSize: 40,
    lineHeight: 45,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: palette.slate,
    fontSize: 15,
    marginTop: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 22,
  },
  featuredCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 22,
  },
  featuredCopy: {
    padding: 20,
    gap: 10,
  },
  featuredTitle: {
    color: palette.white,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    maxWidth: 300,
  },
  featuredSummary: {
    color: '#F4FAF1',
    fontSize: 15,
    lineHeight: 21,
  },
  sectionCard: {
    marginBottom: 22,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EC',
  },
  insightImage: {
    width: 86,
    height: 76,
    borderRadius: 8,
  },
  insightText: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  category: {
    color: palette.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  insightTitle: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  meta: {
    color: palette.slate,
    fontSize: 12,
  },
  eventMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.panel,
    borderRadius: 12,
    padding: 14,
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  month: {
    color: palette.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  day: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  eventText: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  podcastRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EC',
  },
  podcastImage: {
    width: 104,
    height: 74,
    borderRadius: 10,
    backgroundColor: palette.panel,
  },
  podcastText: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },
  podcastLabel: {
    color: palette.forest,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  podcastTitle: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  grantCard: {
    position: 'relative',
    minHeight: 204,
    borderRadius: 16,
    padding: 22,
    backgroundColor: palette.lime,
    overflow: 'hidden',
    marginBottom: 12,
  },
  grantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#BF1E2E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
  },
  grantBadgeText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
  },
  grantIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  grantTitle: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
  },
  grantSummary: {
    color: '#F5FFED',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
});
