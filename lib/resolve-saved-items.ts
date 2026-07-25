import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {
  getEvent,
  getPodcast,
  getStory,
  savedResources,
  type BookmarkType,
} from '@/data/kcic';
import {
  formatContentDate,
  getProgrammeImage,
  type NewsArticle,
  type Opportunity,
  type Programme,
} from '@/lib/content-api';
import type { MediaItem } from '@/lib/media-api';

export type SavedItemType =
  | 'article'
  | 'programme'
  | 'opportunity'
  | 'podcast'
  | 'story'
  | 'event'
  | 'resource';

export type SavedItem = {
  key: string;
  type: SavedItemType;
  id: string;
  title: string;
  meta: string;
  typeLabel: string;
  imageUrl?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  resourceDetail?: string;
  showPlayBadge?: boolean;
};

export type SavedFilter = 'all' | 'insights' | 'programmes' | 'opportunities' | 'media' | 'more';

type ResolveSavedItemsInput = {
  bookmarks: Set<string>;
  articles: NewsArticle[];
  programmes: Programme[];
  opportunities: Opportunity[];
  getItemById: (id: string) => MediaItem | undefined;
};

function typeLabel(type: SavedItemType): string {
  if (type === 'article') return 'Insight';
  if (type === 'programme') return 'Programme';
  if (type === 'opportunity') return 'Opportunity';
  if (type === 'podcast') return 'Media';
  if (type === 'story') return 'Story';
  if (type === 'event') return 'Event';
  return 'Resource';
}

function resolveSingleBookmark(
  key: string,
  input: Omit<ResolveSavedItemsInput, 'bookmarks'>
): SavedItem | null {
  if (key.startsWith('article:programme:')) {
    const slug = key.slice('article:programme:'.length);
    const programme = input.programmes.find((item) => item.slug === slug);
    if (!programme) return null;
    return {
      key,
      type: 'programme',
      id: slug,
      title: programme.title,
      meta: programme.category,
      typeLabel: typeLabel('programme'),
      imageUrl: getProgrammeImage(programme),
      icon: 'account-balance',
    };
  }

  if (key.startsWith('article:opportunity:')) {
    const slug = key.slice('article:opportunity:'.length);
    const opportunity = input.opportunities.find((item) => item.slug === slug);
    if (!opportunity) return null;
    const deadline = formatContentDate(opportunity.deadline);
    return {
      key,
      type: 'opportunity',
      id: slug,
      title: opportunity.title,
      meta: [opportunity.type, deadline || opportunity.location].filter(Boolean).join(' · '),
      typeLabel: typeLabel('opportunity'),
      icon: 'work-outline',
    };
  }

  if (key.startsWith('article:')) {
    const slug = key.slice('article:'.length);
    const article = input.articles.find((item) => item.slug === slug);
    if (!article) return null;
    return {
      key,
      type: 'article',
      id: slug,
      title: article.title,
      meta: [article.category, article.readTime ?? formatContentDate(article.publishedAt)]
        .filter(Boolean)
        .join(' · '),
      typeLabel: typeLabel('article'),
      imageUrl: article.thumbnail,
      icon: 'article',
    };
  }

  if (key.startsWith('podcast:')) {
    const id = key.slice('podcast:'.length);
    const mediaItem = input.getItemById(id);
    if (mediaItem) {
      return {
        key,
        type: 'podcast',
        id,
        title: mediaItem.title,
        meta: [mediaItem.kind === 'podcast' ? 'Podcast' : 'Video', formatContentDate(mediaItem.publishedAt)]
          .filter(Boolean)
          .join(' · '),
        typeLabel: typeLabel('podcast'),
        imageUrl: mediaItem.thumbnail,
        icon: mediaItem.kind === 'podcast' ? 'podcasts' : 'videocam',
        showPlayBadge: true,
      };
    }

    const podcast = getPodcast(id);
    if (!podcast) return null;
    return {
      key,
      type: 'podcast',
      id,
      title: podcast.title,
      meta: podcast.publishedLabel,
      typeLabel: typeLabel('podcast'),
      imageUrl: podcast.thumbnail,
      icon: 'podcasts',
      showPlayBadge: true,
    };
  }

  const separator = key.indexOf(':');
  if (separator === -1) return null;

  const type = key.slice(0, separator) as BookmarkType;
  const id = key.slice(separator + 1);

  if (type === 'story') {
    const story = getStory(id);
    if (!story) return null;
    return {
      key,
      type: 'story',
      id,
      title: story.title,
      meta: `${story.sector} · ${story.founder}`,
      typeLabel: typeLabel('story'),
      imageUrl: story.image,
      icon: 'auto-stories',
    };
  }

  if (type === 'event') {
    const event = getEvent(id);
    if (!event) return null;
    return {
      key,
      type: 'event',
      id,
      title: event.title,
      meta: `${event.date} · ${event.location}`,
      typeLabel: typeLabel('event'),
      imageUrl: event.image,
      icon: 'event',
    };
  }

  if (type === 'resource') {
    const resource = savedResources.find((item) => item.id === id);
    if (!resource) return null;
    return {
      key,
      type: 'resource',
      id,
      title: resource.title,
      meta: resource.detail,
      typeLabel: typeLabel('resource'),
      icon: resource.icon as SavedItem['icon'],
      resourceDetail: resource.detail,
    };
  }

  return null;
}

export function resolveSavedItems(input: ResolveSavedItemsInput): SavedItem[] {
  return Array.from(input.bookmarks)
    .map((key) =>
      resolveSingleBookmark(key, {
        articles: input.articles,
        programmes: input.programmes,
        opportunities: input.opportunities,
        getItemById: input.getItemById,
      })
    )
    .filter((item): item is SavedItem => item !== null);
}

export function savedFilterForType(type: SavedItemType): SavedFilter {
  if (type === 'article') return 'insights';
  if (type === 'programme') return 'programmes';
  if (type === 'opportunity') return 'opportunities';
  if (type === 'podcast') return 'media';
  return 'more';
}

export function filterSavedItems(items: SavedItem[], filter: SavedFilter): SavedItem[] {
  if (filter === 'all') return items;
  return items.filter((item) => savedFilterForType(item.type) === filter);
}

export function countSavedByFilter(items: SavedItem[]): Record<SavedFilter, number> {
  const counts: Record<SavedFilter, number> = {
    all: items.length,
    insights: 0,
    programmes: 0,
    opportunities: 0,
    media: 0,
    more: 0,
  };

  for (const item of items) {
    counts[savedFilterForType(item.type)] += 1;
  }

  return counts;
}
