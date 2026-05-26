import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openContent } from '@/lib/navigation';
import { useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, Pill, TopBar, palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { articles, bookmarkKey, filterArticlesByInsight, insightFilters } from '@/data/kcic';

export default function InsightsScreen() {
  const router = useRouter();
  const { hasUnreadNotifications, toggleBookmark, isBookmarked } = usePrototype();
  const [activeFilter, setActiveFilter] = useState(insightFilters[0].value);

  const filteredArticles = useMemo(
    () => filterArticlesByInsight(articles, activeFilter),
    [activeFilter]
  );

  return (
    <AppScreen>
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

      {filteredArticles.map((article) => {
        const bKey = bookmarkKey('article', article.id);
        const saved = isBookmarked(bKey);

        return (
          <Card key={article.id} style={styles.articleCard}>
            <Pressable onPress={() => openContent('article', article.id)}>
              <Image source={{ uri: article.image }} style={styles.articleImage} contentFit="cover" />
            </Pressable>
            <View style={styles.articleBody}>
              <Pressable onPress={() => openContent('article', article.id)}>
                <Text style={styles.category}>{article.category}</Text>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.summary} numberOfLines={3}>
                  {article.summary}
                </Text>
              </Pressable>
              <View style={styles.articleMeta}>
                <Text style={styles.meta}>{article.date}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>{article.readTime}</Text>
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
                      message: `${article.title}\n\n${article.summary}`,
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
});
