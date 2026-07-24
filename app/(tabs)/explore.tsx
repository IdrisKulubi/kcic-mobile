import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openContent } from '@/lib/navigation';
import { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, Pill, TopBar, palette } from '@/components/kcic/ui';
import { ContentMessage, ContentSkeleton } from '@/components/kcic/content-state';
import { useContent } from '@/context/content-context';
import { usePrototype } from '@/context/prototype-context';
import { bookmarkKey, insightFilters } from '@/data/kcic';
import { formatContentDate } from '@/lib/content-api';

export default function InsightsScreen() {
  const router = useRouter();
  const { hasUnreadNotifications, toggleBookmark, isBookmarked } = usePrototype();
  const { articles, programmes, opportunities, loading, refreshing, error, refresh } = useContent();
  const [activeFilter, setActiveFilter] = useState(insightFilters[0].value);

  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') return articles;
    const filter = insightFilters.find((item) => item.value === activeFilter);
    if (!filter || !('keywords' in filter)) return articles;
    return articles.filter((article) => {
      const haystack = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
      return filter.keywords?.some((keyword) => haystack.includes(keyword));
    });
  }, [activeFilter, articles]);

  return (
    <AppScreen refreshing={refreshing} onRefresh={() => void refresh()}>
      <TopBar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <Text style={styles.title}>Insights & Data</Text>
      <Text style={styles.intro}>
        Explore reports, SME stories, and actionable climate intelligence for the KCIC ecosystem.
      </Text>

      <View style={styles.filters}>
        {insightFilters.map((filter, index) => (
          <Pill
            key={filter.value}
            label={filter.label}
            active={activeFilter === filter.value}
            tone={index === 2 ? 'blue' : 'green'}
            onPress={() => setActiveFilter(filter.value)}
          />
        ))}
      </View>

      {loading && articles.length === 0 ? <ContentSkeleton /> : null}
      {error && articles.length === 0 ? (
        <ContentMessage title="Insights could not load" body={error} onRetry={() => void refresh()} />
      ) : null}
      {!loading && !error && filteredArticles.length === 0 ? (
        <ContentMessage
          title="No matching insights"
          body="Try another topic or check back after KCIC publishes new content."
        />
      ) : null}

      {filteredArticles.map((article) => {
        const bKey = bookmarkKey('article', article.slug);
        const saved = isBookmarked(bKey);

        return (
          <Card key={article.id} style={styles.articleCard}>
            <Pressable onPress={() => openContent('article', article.slug)}>
              <Image source={{ uri: article.thumbnail }} style={styles.articleImage} contentFit="cover" />
            </Pressable>
            <View style={styles.articleBody}>
              <Pressable onPress={() => openContent('article', article.slug)}>
                <Text style={styles.category}>{article.category}</Text>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.summary} numberOfLines={3}>
                  {article.excerpt}
                </Text>
              </Pressable>
              <View style={styles.articleMeta}>
                <Text style={styles.meta}>{formatContentDate(article.publishedAt)}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>{article.readTime ?? 'Read article'}</Text>
                <Pressable onPress={() => toggleBookmark(bKey)} hitSlop={8}>
                  <MaterialIcons
                    name={saved ? 'bookmark' : 'bookmark-border'}
                    size={18}
                    color={saved ? palette.limeDark : palette.ink}
                  />
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await Share.share({
                      message: `${article.title}\n\n${article.excerpt}`,
                      title: article.title,
                    });
                  }}
                  hitSlop={8}>
                  <MaterialIcons name="share" size={18} color={palette.ink} />
                </Pressable>
              </View>
            </View>
          </Card>
        );
      })}

      <Text style={styles.programmesTitle}>Programmes</Text>
      <Text style={styles.programmesIntro}>
        Explore active KCIC initiatives and application opportunities.
      </Text>
      {programmes.map((programme) => (
        <Card
          key={programme.id}
          style={styles.programmeCard}
          onPress={() => openContent('programme', programme.slug)}>
          <Image source={{ uri: programme.headerImage ?? programme.image }} style={styles.programmeImage} />
          <View style={styles.programmeBody}>
            <Text style={styles.category}>{programme.category}</Text>
            <Text style={styles.programmeName}>{programme.title}</Text>
            <Text style={styles.summary} numberOfLines={3}>
              {programme.description}
            </Text>
          </View>
        </Card>
      ))}

      <Text style={styles.programmesTitle}>Open opportunities</Text>
      <Text style={styles.programmesIntro}>
        Jobs, tenders, consulting assignments, and calls currently available through KCIC.
      </Text>
      {opportunities.map((opportunity) => (
        <Card
          key={opportunity.id}
          style={styles.opportunityCard}
          onPress={() => openContent('opportunity', opportunity.slug)}>
          <View style={styles.opportunityMeta}>
            <Text style={styles.category}>{opportunity.type}</Text>
            {opportunity.isFeatured ? <Pill label="Featured" tone="cream" /> : null}
          </View>
          <Text style={styles.programmeName}>{opportunity.title}</Text>
          <Text style={styles.summary} numberOfLines={3}>
            {opportunity.summary}
          </Text>
          <Text style={styles.opportunityDeadline}>
            {opportunity.deadline
              ? `Deadline ${formatContentDate(opportunity.deadline)}`
              : opportunity.location ?? 'View details'}
          </Text>
        </Card>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: 0,
  },
  intro: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 18,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  articleCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 22,
  },
  articleImage: {
    height: 178,
    width: '100%',
  },
  articleBody: {
    padding: 20,
  },
  category: {
    color: palette.limeDark,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  articleTitle: {
    color: palette.ink,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '900',
    marginBottom: 12,
  },
  summary: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
  meta: {
    color: palette.slate,
    fontSize: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9D3C5',
  },
  programmesTitle: {
    color: palette.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  programmesIntro: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },
  programmeCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 18,
  },
  programmeImage: {
    width: '100%',
    height: 152,
  },
  programmeBody: {
    padding: 18,
  },
  programmeName: {
    color: palette.ink,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 10,
  },
  opportunityCard: {
    marginBottom: 14,
  },
  opportunityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  opportunityDeadline: {
    color: palette.brown,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 14,
  },
});
