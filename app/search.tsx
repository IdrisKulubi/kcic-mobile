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
import {
  buildContentSearchResults,
  groupSearchResults,
  searchResultIcon,
} from '@/lib/content-search';
import { openContent, openPodcastEpisode } from '@/lib/navigation';

export default function SearchScreen() {
  const router = useRouter();
  const { articles, programmes, opportunities } = useContent();
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => buildContentSearchResults(query, articles, programmes, opportunities),
    [articles, opportunities, programmes, query]
  );

  const grouped = useMemo(() => groupSearchResults(results), [results]);
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
                  <MaterialIcons name={searchResultIcon(item.type)} size={22} color={palette.blue} />
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
