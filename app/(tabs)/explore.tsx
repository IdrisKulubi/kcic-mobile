import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { useContent } from '@/context/content-context';
import { useGlobalHeader } from '@/context/global-header-context';
import { usePrototype } from '@/context/prototype-context';
import { bookmarkKey, insightFilters } from '@/data/kcic';
import { formatContentDate, getProgrammeImage, type NewsArticle } from '@/lib/content-api';
import {
  buildContentSearchResults,
  groupSearchResults,
  searchResultIcon,
  type SearchResult,
} from '@/lib/content-search';
import { openContent, openPodcastEpisode } from '@/lib/navigation';
import { hapticLight, hapticSelection } from '@/lib/haptics';
import { TAB_SCREEN_BOTTOM_INSET } from '@/lib/tab-bar-layout';
import { fonts } from '@/lib/typography';

type ExploreSection = 'all' | 'opportunities' | 'insights' | 'programmes';

const sectionFilters: {
  key: ExploreSection;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: 'all', label: 'Discover', icon: 'explore' },
  { key: 'opportunities', label: 'Opportunities', icon: 'work-outline' },
  { key: 'insights', label: 'Insights', icon: 'article' },
  { key: 'programmes', label: 'Programmes', icon: 'hub' },
];

const exploreThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    feature: '#EEF5E8',
    accentSoft: '#E7F3DB',
    blueSoft: '#DDF5FB',
    brownSoft: '#FCEAE5',
    imageShade: 'rgba(34, 35, 37, 0.25)',
    activeText: '#303133',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    feature: '#24301E',
    accentSoft: '#2A3822',
    blueSoft: '#17323A',
    brownSoft: '#3A2925',
    imageShade: 'rgba(15, 16, 17, 0.42)',
    activeText: '#303133',
  },
} as const;

export default function ExploreScreen() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? exploreThemes.dark : exploreThemes.light;
  const { toggleBookmark, isBookmarked } = usePrototype();
  const { articles, programmes, opportunities, loading, refreshing, error, refresh } = useContent();
  const { searchQuery, setSearchQuery, isSearching, onScroll, contentTopPadding } = useGlobalHeader();
  const [activeSection, setActiveSection] = useState<ExploreSection>('all');
  const [activeInsightFilter, setActiveInsightFilter] = useState(insightFilters[0].value);

  const trimmedSearchQuery = searchQuery.trim();
  const searchResults = useMemo(
    () => buildContentSearchResults(trimmedSearchQuery, articles, programmes, opportunities),
    [articles, opportunities, programmes, trimmedSearchQuery]
  );
  const groupedSearchResults = useMemo(() => groupSearchResults(searchResults), [searchResults]);

  const featuredOpportunity =
    opportunities.find((opportunity) => opportunity.isFeatured) ?? opportunities[0];
  const additionalOpportunities = featuredOpportunity
    ? opportunities.filter((opportunity) => opportunity.id !== featuredOpportunity.id)
    : opportunities;

  const filteredArticles = useMemo(() => {
    if (activeInsightFilter === 'all') return articles;
    const filter = insightFilters.find((item) => item.value === activeInsightFilter);
    if (!filter || !('keywords' in filter)) return articles;

    return articles.filter((article) => {
      const haystack = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
      return filter.keywords?.some((keyword) => haystack.includes(keyword));
    });
  }, [activeInsightFilter, articles]);

  const showOpportunities = activeSection === 'all' || activeSection === 'opportunities';
  const showInsights = activeSection === 'all' || activeSection === 'insights';
  const showProgrammes = activeSection === 'all' || activeSection === 'programmes';
  const hasNoContent =
    !loading && !error && articles.length === 0 && programmes.length === 0 && opportunities.length === 0;

  const shareArticle = async (article: NewsArticle) => {
    await Share.share({
      message: `${article.title}\n\n${article.excerpt}`,
      title: article.title,
    });
  };

  return (
    <SafeAreaView
      style={[styles.exploreScreen, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.ScrollView
        style={[styles.exploreScroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: contentTopPadding },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor={palette.green}
          />
        }>
      <View style={styles.heroCopy}>
         <Text style={[styles.intro, { color: colors.muted }]}>
          {isSearching
            ? `Showing results for "${trimmedSearchQuery}"`
            : 'Find funding, practical insight, and programmes built for climate innovators.'}
        </Text>
      </View>

      {isSearching ? (
        <ExploreSearchResults
          query={trimmedSearchQuery}
          grouped={groupedSearchResults}
          colors={colors}
          onSelect={(item) => {
            hapticLight();
            setSearchQuery('');
            if (item.type === 'podcast') openPodcastEpisode(item.id);
            else openContent(item.type, item.id);
          }}
        />
      ) : (
        <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionFilters}
        accessibilityRole="tablist">
        {sectionFilters.map((filter) => {
          const active = activeSection === filter.key;
          return (
            <Pressable
              key={filter.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (activeSection !== filter.key) {
                  hapticSelection();
                }
                setActiveSection(filter.key);
              }}
              style={({ pressed }) => [
                styles.sectionFilter,
                {
                  backgroundColor: active ? palette.green : colors.surface,
                  borderColor: active ? palette.green : colors.border,
                  opacity: pressed ? 0.76 : 1,
                },
              ]}>
              <MaterialIcons
                name={filter.icon}
                size={17}
                color={active ? colors.activeText : colors.muted}
              />
              <Text
                style={[
                  styles.sectionFilterText,
                  { color: active ? colors.activeText : colors.ink },
                ]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && hasNoContent !== true ? <ExploreSkeleton colors={colors} /> : null}

      {error && articles.length === 0 && programmes.length === 0 && opportunities.length === 0 ? (
        <StatePanel
          icon="cloud-off"
          title="Explore is temporarily unavailable"
          body={error}
          actionLabel="Try again"
          onAction={() => void refresh()}
          colors={colors}
        />
      ) : null}

      {hasNoContent ? (
        <StatePanel
          icon="explore-off"
          title="Fresh content is on the way"
          body="KCIC opportunities, insights, and programmes will appear here as they are published."
          actionLabel="Refresh"
          onAction={() => void refresh()}
          colors={colors}
        />
      ) : null}

      {/* {!loading && featuredOpportunity && showOpportunities ? (
        <View style={styles.section}>
          <SectionHeading
            title="Opportunity spotlight"
            action="See all"
            onAction={() => setActiveSection('opportunities')}
            colors={colors}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View opportunity: ${featuredOpportunity.title}`}
            onPress={() => openContent('opportunity', featuredOpportunity.slug)}
            style={({ pressed }) => [
              styles.featureCard,
              { backgroundColor: colors.feature, opacity: pressed ? 0.84 : 1 },
            ]}>
            <View style={styles.featureTopRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="work-outline" size={20} color={palette.green} />
              </View>
              <View style={[styles.deadlineBadge, { backgroundColor: colors.brownSoft }]}>
                <MaterialIcons name="schedule" size={12} color={palette.brown} />
                <Text style={[styles.deadlineBadgeText, { color: colors.ink }]}>
                  {featuredOpportunity.deadline
                    ? `Closes ${formatContentDate(featuredOpportunity.deadline)}`
                    : 'Applications open'}
                </Text>
              </View>
            </View>
            <Text style={[styles.featureType, { color: colors.muted }]}>
              {featuredOpportunity.type}
            </Text>
            <Text style={[styles.featureTitle, { color: colors.ink }]} numberOfLines={2}>
              {featuredOpportunity.title}
            </Text>
            <Text style={[styles.featureSummary, { color: colors.muted }]} numberOfLines={2}>
              {featuredOpportunity.summary}
            </Text>
            <View style={styles.featureFooter}>
              <View style={[styles.featureCta, { backgroundColor: palette.green }]}>
                <Text style={[styles.featureCtaText, { color: colors.activeText }]}>View details</Text>
                <MaterialIcons name="arrow-forward" size={15} color={colors.activeText} />
              </View>
              {featuredOpportunity.location ? (
                <View style={styles.location}>
                  <MaterialIcons name="location-on" size={15} color={colors.muted} />
                  <Text style={[styles.locationText, { color: colors.muted }]} numberOfLines={1}>
                    {featuredOpportunity.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>
      ) : null} */}

      {!loading && showInsights && articles.length > 0 ? (
        <View style={styles.section}>
          <SectionHeading
            title="Latest insights"
            action="Browse"
            onAction={() => setActiveSection('insights')}
            colors={colors}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.insightFilters}>
            {insightFilters.map((filter) => {
              const active = activeInsightFilter === filter.value;
              return (
                <Pressable
                  key={filter.value}
                  onPress={() => {
                    if (activeInsightFilter !== filter.value) {
                      hapticSelection();
                    }
                    setActiveInsightFilter(filter.value);
                  }}
                  style={[
                    styles.insightFilter,
                    {
                      backgroundColor: active ? colors.blueSoft : 'transparent',
                      borderColor: active ? palette.blue : colors.border,
                    },
                  ]}>
                  <Text style={[styles.insightFilterText, { color: colors.ink }]}>{filter.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredArticles.length > 0 ? (
            <>
              <FeaturedInsight
                article={filteredArticles[0]}
                saved={isBookmarked(bookmarkKey('article', filteredArticles[0].slug))}
                onToggleSave={() =>
                  toggleBookmark(bookmarkKey('article', filteredArticles[0].slug))
                }
                onShare={() => void shareArticle(filteredArticles[0])}
                colors={colors}
              />
              <View style={[styles.insightList, { backgroundColor: colors.surface }]}>
                {filteredArticles.slice(1, 4).map((article, index, items) => (
                  <CompactInsight
                    key={article.id}
                    article={article}
                    saved={isBookmarked(bookmarkKey('article', article.slug))}
                    onToggleSave={() => toggleBookmark(bookmarkKey('article', article.slug))}
                    showDivider={index < items.length - 1}
                    colors={colors}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.inlineEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialIcons name="filter-alt-off" size={22} color={palette.blue} />
              <Text style={[styles.inlineEmptyText, { color: colors.muted }]}>
                No insights match this topic yet. Choose another filter.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {!loading && showProgrammes && programmes.length > 0 ? (
        <View style={styles.section}>
          <SectionHeading
            title="Active programmes"
            action="Explore"
            onAction={() => setActiveSection('programmes')}
            colors={colors}
          />
          <Text style={[styles.sectionIntro, { color: colors.muted }]}>
            Support designed to help climate ventures validate, grow, and scale.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.programmeRail}>
            {programmes.slice(0, 6).map((programme) => {
              const programmeImage = getProgrammeImage(programme);

              return (
              <Pressable
                key={programme.id}
                accessibilityRole="button"
                accessibilityLabel={`View programme: ${programme.title}`}
                onPress={() => openContent('programme', programme.slug)}
                style={({ pressed }) => [
                  styles.programmeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}>
                <View style={styles.programmeMedia}>
                  {programmeImage ? (
                    <Image
                      source={{ uri: programmeImage }}
                      style={styles.programmeImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.programmeImage,
                        { backgroundColor: programme.color || colors.surfaceAlt },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.programmeCategoryChip,
                      { backgroundColor: `${colors.surface}E6` },
                    ]}>
                    <View style={[styles.programmeDot, { backgroundColor: palette.blue }]} />
                    <Text style={[styles.programmeCategory, { color: colors.muted }]} numberOfLines={1}>
                      {programme.category}
                    </Text>
                  </View>
                  <LinearGradient
                    colors={['transparent', 'rgba(15, 16, 17, 0.75)']}
                    style={styles.programmeScrim}
                    pointerEvents="none"
                  />
                  <View style={styles.programmeOverlay}>
                    <Text style={styles.programmeTitle} numberOfLines={2}>
                      {programme.title}
                    </Text>
                    <View style={styles.textLink}>
                      <Text style={styles.textLinkLabel}>View programme</Text>
                      <MaterialIcons name="arrow-forward" size={15} color={palette.green} />
                    </View>
                  </View>
                </View>
              </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {!loading && showOpportunities && additionalOpportunities.length > 0 ? (
        <View style={styles.section}>
          <SectionHeading title="More opportunities" colors={colors} />
          <View style={[styles.opportunityList, { backgroundColor: colors.surface }]}>
            {additionalOpportunities.slice(0, activeSection === 'opportunities' ? 12 : 4).map(
              (opportunity, index, items) => (
                <Pressable
                  key={opportunity.id}
                  accessibilityRole="button"
                  onPress={() => openContent('opportunity', opportunity.slug)}
                  style={({ pressed }) => [
                    styles.opportunityRow,
                    index < items.length - 1
                      ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }
                      : null,
                    { opacity: pressed ? 0.68 : 1 },
                  ]}>
                  <View style={[styles.opportunityIcon, { backgroundColor: colors.accentSoft }]}>
                    <MaterialIcons name="north-east" size={18} color={palette.green} />
                  </View>
                  <View style={styles.opportunityCopy}>
                    <Text style={[styles.opportunityType, { color: colors.muted }]}>
                      {opportunity.type}
                    </Text>
                    <Text style={[styles.opportunityTitle, { color: colors.ink }]} numberOfLines={2}>
                      {opportunity.title}
                    </Text>
                    <Text style={[styles.opportunityDeadline, { color: palette.brown }]}>
                      {opportunity.deadline
                        ? `Deadline ${formatContentDate(opportunity.deadline)}`
                        : opportunity.location ?? 'View details'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
                </Pressable>
              )
            )}
          </View>
        </View>
      ) : null}
        </>
      )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function ExploreSearchResults({
  query,
  grouped,
  colors,
  onSelect,
}: {
  query: string;
  grouped: [string, SearchResult[]][];
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
  onSelect: (item: SearchResult) => void;
}) {
  if (grouped.length === 0) {
    return (
      <View style={[styles.searchEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialIcons name="search-off" size={24} color={palette.blue} />
        <Text style={[styles.searchEmptyTitle, { color: colors.ink }]}>No results found</Text>
        <Text style={[styles.searchEmptyBody, { color: colors.muted }]}>
          No matches for &quot;{query}&quot;. Try a different keyword.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.searchResults}>
      {grouped.map(([section, items]) => (
        <View key={section} style={styles.searchSection}>
          <Text style={[styles.searchSectionTitle, { color: colors.muted }]}>{section}</Text>
          <View style={[styles.searchSectionList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {items.map((item, index) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                accessibilityRole="button"
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.searchResultRow,
                  index < items.length - 1
                    ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }
                    : null,
                  { opacity: pressed ? 0.72 : 1 },
                ]}>
                <View style={[styles.searchResultIcon, { backgroundColor: colors.blueSoft }]}>
                  <MaterialIcons name={searchResultIcon(item.type)} size={20} color={palette.blue} />
                </View>
                <View style={styles.searchResultCopy}>
                  <Text style={[styles.searchResultTitle, { color: colors.ink }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.searchResultSubtitle, { color: colors.muted }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
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
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
      {action && onAction ? (
        <Pressable hitSlop={8} onPress={onAction} style={styles.sectionAction}>
          <Text style={[styles.sectionActionText, { color: colors.ink }]}>{action}</Text>
          <MaterialIcons name="arrow-forward" size={16} color={palette.green} />
        </Pressable>
      ) : null}
    </View>
  );
}

function FeaturedInsight({
  article,
  saved,
  onToggleSave,
  onShare,
  colors,
}: {
  article: NewsArticle;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
}) {
  return (
    <View style={[styles.featuredInsight, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => openContent('article', article.slug)}
        style={({ pressed }) => ({ opacity: pressed ? 0.84 : 1 })}>
        <View style={styles.featuredInsightImageWrap}>
          <Image source={{ uri: article.thumbnail }} style={styles.featuredInsightImage} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.imageShade }]} />
          <View style={[styles.articleCategoryBadge, { backgroundColor: colors.surface }]}>
            <View style={[styles.articleCategoryDot, { backgroundColor: palette.blue }]} />
            <Text style={[styles.articleCategoryText, { color: colors.ink }]} numberOfLines={1}>
              {article.category}
            </Text>
          </View>
        </View>
        <View style={styles.featuredInsightBody}>
          <Text style={[styles.featuredInsightTitle, { color: colors.ink }]} numberOfLines={3}>
            {article.title}
          </Text>
          <Text style={[styles.featuredInsightSummary, { color: colors.muted }]} numberOfLines={2}>
            {article.excerpt}
          </Text>
        </View>
      </Pressable>
      <View style={[styles.articleMetaRow, { borderTopColor: colors.border }]}>
        <View style={styles.articleMetaCopy}>
          <Text style={[styles.articleMetaText, { color: colors.muted }]}>
            {formatContentDate(article.publishedAt)}
          </Text>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <Text style={[styles.articleMetaText, { color: colors.muted }]}>
            {article.readTime ?? 'Read article'}
          </Text>
        </View>
        <View style={styles.articleActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove bookmark' : 'Save article'}
            hitSlop={8}
            onPress={onToggleSave}>
            <MaterialIcons
              name={saved ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={saved ? palette.green : colors.muted}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share article"
            hitSlop={8}
            onPress={onShare}>
            <MaterialIcons name="ios-share" size={19} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CompactInsight({
  article,
  saved,
  onToggleSave,
  showDivider,
  colors,
}: {
  article: NewsArticle;
  saved: boolean;
  onToggleSave: () => void;
  showDivider: boolean;
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openContent('article', article.slug)}
      style={({ pressed }) => [
        styles.compactInsight,
        showDivider
          ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }
          : null,
        { opacity: pressed ? 0.72 : 1 },
      ]}>
      <Image source={{ uri: article.thumbnail }} style={styles.compactInsightImage} contentFit="cover" />
      <View style={styles.compactInsightCopy}>
        <Text style={[styles.compactInsightCategory, { color: colors.muted }]} numberOfLines={1}>
          {article.category}
        </Text>
        <Text style={[styles.compactInsightTitle, { color: colors.ink }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.compactInsightMeta, { color: colors.muted }]}>
          {article.readTime ?? formatContentDate(article.publishedAt)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove bookmark' : 'Save article'}
        hitSlop={10}
        onPress={(event) => {
          event.stopPropagation();
          onToggleSave();
        }}>
        <MaterialIcons
          name={saved ? 'bookmark' : 'bookmark-border'}
          size={20}
          color={saved ? palette.green : colors.muted}
        />
      </Pressable>
    </Pressable>
  );
}

function ExploreSkeleton({
  colors,
}: {
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
}) {
  return (
    <View style={styles.skeletonWrap} accessibilityLabel="Loading Explore content">
      <View style={[styles.skeletonFeature, { backgroundColor: colors.surface }]}>
        <View style={[styles.skeletonIcon, { backgroundColor: colors.surfaceAlt }]} />
        <View style={[styles.skeletonLineShort, { backgroundColor: colors.surfaceAlt }]} />
        <View style={[styles.skeletonLineLong, { backgroundColor: colors.surfaceAlt }]} />
        <View style={[styles.skeletonLineMedium, { backgroundColor: colors.surfaceAlt }]} />
      </View>
      <View style={[styles.skeletonRow, { backgroundColor: colors.surface }]}>
        <View style={[styles.skeletonImage, { backgroundColor: colors.surfaceAlt }]} />
        <View style={styles.skeletonCopy}>
          <View style={[styles.skeletonLineShort, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.skeletonLineLong, { backgroundColor: colors.surfaceAlt }]} />
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
  colors: (typeof exploreThemes)[keyof typeof exploreThemes];
}) {
  return (
    <View style={[styles.statePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.stateIcon, { backgroundColor: colors.blueSoft }]}>
        <MaterialIcons name={icon} size={24} color={palette.blue} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.stateBody, { color: colors.muted }]}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [
          styles.stateAction,
          { backgroundColor: palette.green, opacity: pressed ? 0.76 : 1 },
        ]}>
        <Text style={[styles.stateActionText, { color: colors.activeText }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  exploreScreen: {
    flex: 1,
  },
  exploreScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: TAB_SCREEN_BOTTOM_INSET,
  },
  heroCopy: {
    maxWidth: 420,
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    lineHeight: 41,
    letterSpacing: -0.6,
  },
  intro: {
    maxWidth: 360,
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionFilters: {
    gap: 9,
    paddingRight: 18,
    paddingBottom: 3,
  },
  sectionFilter: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionFilterText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  section: {
    marginTop: 30,
  },
  sectionHeading: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.25,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionActionText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  sectionIntro: {
    maxWidth: 390,
    marginTop: -7,
    marginBottom: 15,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  featureCard: {
    borderRadius: 14,
    padding: 14,
  },
  featureTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineBadge: {
    minHeight: 26,
    maxWidth: '76%',
    borderRadius: 13,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineBadgeText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  featureType: {
    marginBottom: 4,
    fontFamily: fonts.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featureTitle: {
    maxWidth: 440,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: -0.25,
  },
  featureSummary: {
    maxWidth: 480,
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  featureFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  featureCta: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  featureCtaText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  location: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  insightFilters: {
    gap: 8,
    paddingRight: 18,
    marginBottom: 14,
  },
  insightFilter: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightFilterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  featuredInsight: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
  },
  featuredInsightImageWrap: {
    height: 174,
    overflow: 'hidden',
  },
  featuredInsightImage: {
    width: '100%',
    height: '100%',
  },
  articleCategoryBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    maxWidth: '82%',
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  articleCategoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  articleCategoryText: {
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  featuredInsightBody: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 16,
  },
  featuredInsightTitle: {
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  featuredInsightSummary: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  articleMetaRow: {
    minHeight: 50,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  articleMetaCopy: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  articleMetaText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  articleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  insightList: {
    overflow: 'hidden',
    marginTop: 12,
    borderRadius: 16,
  },
  compactInsight: {
    minHeight: 112,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactInsightImage: {
    width: 82,
    height: 82,
    borderRadius: 10,
  },
  compactInsightCopy: {
    minWidth: 0,
    flex: 1,
  },
  compactInsightCategory: {
    marginBottom: 5,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  compactInsightTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  compactInsightMeta: {
    marginTop: 7,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  programmeRail: {
    gap: 12,
    paddingRight: 18,
    paddingBottom: 2,
  },
  programmeCard: {
    width: 220,
    height: 200,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
  },
  programmeMedia: {
    flex: 1,
    position: 'relative',
  },
  programmeImage: {
    width: '100%',
    height: '100%',
  },
  programmeCategoryChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    maxWidth: '78%',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  programmeScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 112,
    zIndex: 1,
  },
  programmeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  programmeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  programmeCategory: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  programmeTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 19,
    color: '#F4F4F5',
  },
  textLink: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  textLinkLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: '#F4F4F5',
  },
  opportunityList: {
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 8,
  },
  opportunityRow: {
    minHeight: 118,
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 5,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  opportunityTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  opportunityDeadline: {
    marginTop: 7,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  inlineEmpty: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inlineEmptyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  skeletonWrap: {
    gap: 12,
    marginTop: 30,
  },
  skeletonFeature: {
    minHeight: 250,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 24,
  },
  skeletonLineShort: {
    width: '31%',
    height: 10,
    borderRadius: 5,
  },
  skeletonLineLong: {
    width: '92%',
    height: 18,
    borderRadius: 6,
  },
  skeletonLineMedium: {
    width: '68%',
    height: 13,
    borderRadius: 6,
  },
  skeletonRow: {
    minHeight: 110,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonImage: {
    width: 82,
    height: 82,
    borderRadius: 10,
  },
  skeletonCopy: {
    flex: 1,
    gap: 12,
  },
  statePanel: {
    marginTop: 30,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stateTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
    textAlign: 'center',
  },
  stateBody: {
    maxWidth: 330,
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  stateAction: {
    minHeight: 42,
    marginTop: 18,
    borderRadius: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateActionText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  searchResults: {
    marginTop: 8,
    gap: 18,
  },
  searchSection: {
    gap: 10,
  },
  searchSectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  searchSectionList: {
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
  },
  searchResultRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchResultIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultCopy: {
    flex: 1,
    gap: 3,
  },
  searchResultTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  searchResultSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  searchEmpty: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  searchEmptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
    textAlign: 'center',
  },
  searchEmptyBody: {
    maxWidth: 300,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
