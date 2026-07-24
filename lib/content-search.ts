import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { events, podcasts, stories } from '@/data/kcic';
import { formatContentDate, type NewsArticle, type Opportunity, type Programme } from '@/lib/content-api';

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'article' | 'story' | 'event' | 'podcast' | 'programme' | 'opportunity';
};

export const searchTypeLabels: Record<SearchResult['type'], string> = {
  article: 'Articles',
  story: 'SME Stories',
  event: 'Events',
  podcast: 'Podcasts',
  programme: 'Programmes',
  opportunity: 'Opportunities',
};

export function searchResultIcon(
  type: SearchResult['type']
): keyof typeof MaterialIcons.glyphMap {
  if (type === 'article') return 'article';
  if (type === 'programme') return 'account-balance';
  if (type === 'opportunity') return 'work-outline';
  if (type === 'story') return 'business';
  if (type === 'event') return 'event';
  return 'play-circle-outline';
}

export function buildContentSearchResults(
  query: string,
  articles: NewsArticle[],
  programmes: Programme[],
  opportunities: Opportunity[]
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  articles.forEach((article) => {
    const haystack = `${article.title} ${article.excerpt} ${article.category}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: article.slug,
        title: article.title,
        subtitle: article.category,
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

  stories.forEach((story) => {
    const haystack = `${story.title} ${story.summary} ${story.sector} ${story.founder}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: story.id,
        title: story.title,
        subtitle: story.sector,
        type: 'story',
      });
    }
  });

  events.forEach((event) => {
    const haystack = `${event.title} ${event.location} ${event.type}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: event.id,
        title: event.title,
        subtitle: event.date,
        type: 'event',
      });
    }
  });

  podcasts.forEach((podcast) => {
    const haystack = `${podcast.title} ${podcast.summary}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        id: podcast.id,
        title: podcast.title,
        subtitle: podcast.publishedLabel,
        type: 'podcast',
      });
    }
  });

  return results;
}

export function groupSearchResults(results: SearchResult[]) {
  const map = new Map<string, SearchResult[]>();
  results.forEach((result) => {
    const label = searchTypeLabels[result.type];
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(result);
  });
  return Array.from(map.entries());
}
