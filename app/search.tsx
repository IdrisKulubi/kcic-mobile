import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { useContent } from '@/context/content-context';
import { openContent, openPodcastEpisode } from '@/lib/navigation';
import { events, podcasts, stories } from '@/data/kcic';
import { formatContentDate, type NewsArticle, type Opportunity, type Programme } from '@/lib/content-api';

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'article' | 'story' | 'event' | 'podcast' | 'programme' | 'opportunity';
};

function buildResults(
  query: string,
  articles: NewsArticle[],
  programmes: Programme[],
  opportunities: Opportunity[]
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  articles.forEach((a) => {
    const haystack = `${a.title} ${a.excerpt} ${a.category}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: a.slug,
        title: a.title,
        subtitle: a.category,
        type: 'article',
      });
    }
  });

  programmes.forEach((programme) => {
    const haystack = `${programme.title} ${programme.description} ${programme.category}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: programme.slug,
        title: programme.title,
        subtitle: programme.category,
        type: 'programme',
      });
    }
  });

  opportunities.forEach((opportunity) => {
    const haystack = `${opportunity.title} ${opportunity.summary} ${opportunity.type}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: opportunity.slug,
        title: opportunity.title,
        subtitle: opportunity.deadline
          ? `Deadline ${formatContentDate(opportunity.deadline)}`
          : opportunity.type,
        type: 'opportunity',
      });
    }
  });

  stories.forEach((s) => {
    const haystack = `${s.title} ${s.summary} ${s.sector} ${s.founder}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: s.id,
        title: s.title,
        subtitle: s.sector,
        type: 'story',
      });
    }
  });

  events.forEach((e) => {
    const haystack = `${e.title} ${e.location} ${e.type}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: e.id,
        title: e.title,
        subtitle: e.date,
        type: 'event',
      });
    }
  });

  podcasts.forEach((p) => {
    const haystack = `${p.title} ${p.summary}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: p.id,
        title: p.title,
        subtitle: p.publishedLabel,
        type: 'podcast',
      });
    }
  });

  return results;
}

const typeLabels: Record<SearchResult['type'], string> = {
  article: 'Articles',
  story: 'SME Stories',
  event: 'Events',
  podcast: 'Podcasts',
  programme: 'Programmes',
  opportunity: 'Opportunities',
};

export default function SearchScreen() {
  const router = useRouter();
  const { articles, programmes, opportunities } = useContent();
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => buildResults(query, articles, programmes, opportunities),
    [articles, opportunities, programmes, query]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach((r) => {
      const label = typeLabels[r.type];
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(r);
    });
    return Array.from(map.entries());
  }, [results]);

  const trimmedQuery = query.trim();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={22} color={palette.slate} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports, news, policies..."
              placeholderTextColor={palette.muted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          {trimmedQuery.length === 0 ? (
            <Text style={styles.hint}>Search articles, stories, events, and podcasts.</Text>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {trimmedQuery.length > 0 && results.length === 0 ? (
            <Text style={styles.empty}>No results for &quot;{trimmedQuery}&quot;</Text>
          ) : null}

          {grouped.map(([section, items]) => (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {items.map((item) => (
                <Pressable
                  key={`${item.type}-${item.id}`}
                  style={styles.resultRow}
                  onPress={() => {
                    router.back();
                    setTimeout(() => {
                      if (item.type === 'podcast') openPodcastEpisode(item.id);
                      else openContent(item.type, item.id);
                    }, 100);
                  }}>
                  <MaterialIcons
                    name={
                      item.type === 'article'
                        ? 'article'
                        : item.type === 'programme'
                          ? 'account-balance'
                          : item.type === 'opportunity'
                            ? 'work-outline'
                            : item.type === 'story'
                          ? 'business'
                          : item.type === 'event'
                            ? 'event'
                            : 'play-circle-outline'
                    }
                    size={22}
                    color={palette.blue}
                  />
                  <View style={styles.resultText}>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  flex: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.shell,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CDD5CD',
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: palette.ink,
    fontSize: 15,
    paddingVertical: 12,
  },
  hint: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },
  empty: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    marginBottom: 10,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  resultSubtitle: {
    color: palette.slate,
    fontSize: 12,
  },
});
