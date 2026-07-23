import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type Article = {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  image: string;
};

export type Event = {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
};

export type Story = {
  id: string;
  sector: string;
  title: string;
  founder: string;
  location: string;
  impact: string;
  summary: string;
  image: string;
};

export type Podcast = {
  id: string;
  title: string;
  summary: string;
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  duration: string;
  publishedLabel: string;
};

export const articles: Article[] = [
  {
    id: 'solar-regions',
    category: 'Comprehensive Report',
    title: 'The Future of Solar Irrigation in Arid Regions',
    summary:
      'How decentralized solar technologies are helping smallholder farmers reduce reliance on erratic rainfall.',
    date: 'Oct 12, 2024',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'agri-processing',
    category: 'SME Story',
    title: 'Scaling Agri-Processing: The Journey of Fresh Valley',
    summary:
      'A local enterprise used micro-financing to turn post-harvest loss into a profitable supply chain.',
    date: 'Oct 08, 2024',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'carbon-tax',
    category: 'Policy Brief',
    title: 'Navigating New Carbon Tax Regulations',
    summary:
      'A practical guide for mid-sized manufacturers adapting to upcoming regulatory shifts.',
    date: 'Oct 05, 2024',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'investment-trends',
    category: 'Market Analysis',
    title: 'Investment Trends in Renewable Energy',
    summary:
      'Tracking Q3 capital flows into wind, geothermal, and early-stage climate ventures.',
    date: 'Sep 28, 2024',
    readTime: '10 min read',
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80',
  },
];

export const events: Event[] = [
  {
    id: 'green-financing',
    type: 'Webinar',
    title: 'Green Financing Strategies for Startups',
    date: 'Tue, Oct 13',
    time: '10:00 AM EAT',
    location: 'Online (Zoom)',
    image:
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'agritech-expo',
    type: 'Expo',
    title: 'Agri-Tech Innovations Expo 2024',
    date: 'Thu, Oct 15',
    time: '09:00 AM EAT',
    location: 'Nairobi, KICC',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  },
];

export const stories: Story[] = [
  {
    id: 'agriseed',
    sector: 'AgTech',
    title: 'AgriSeed Innovations',
    founder: 'Amina Mwangi',
    location: 'Nairobi, Kenya',
    impact: '10k farmers supported',
    summary:
      'Hyper-local weather data and drought-resistant seed varieties help farmers make sharper planting decisions.',
    image:
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sungrid',
    sector: 'Renewable Energy',
    title: 'SunGrid Solutions',
    founder: 'Daniel Otieno',
    location: 'Kisumu, Kenya',
    impact: '5MW capacity installed',
    summary:
      'Micro-grids bring reliable clean power to productive-use businesses in rural growth centers.',
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'ecohubs',
    sector: 'Waste Management',
    title: 'EcoSort Hubs',
    founder: 'Miriam Njeri',
    location: 'Mombasa, Kenya',
    impact: '200 tons diverted',
    summary:
      'Urban waste is transformed into valuable raw materials through partner collection points.',
    image:
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80',
  },
];

export const podcasts: Podcast[] = [
  {
    id: 'episode-1',
    title: 'KCIC Podcast Episode 1',
    summary:
      'A focused conversation from the KCIC ecosystem on climate innovation, enterprise growth, and practical lessons for founders.',
    youtubeUrl: 'https://www.youtube.com/watch?v=SntfM3fml8E',
    videoId: 'SntfM3fml8E',
    thumbnail: 'https://img.youtube.com/vi/SntfM3fml8E/hqdefault.jpg',
    duration: 'Watch now',
    publishedLabel: 'Latest episode',
  },
  {
    id: 'episode-2',
    title: 'KCIC Podcast Episode 2',
    summary:
      'Insights for entrepreneurs building resilient climate ventures and navigating the support ecosystem.',
    youtubeUrl: 'https://www.youtube.com/watch?v=d5jJq3LN1tc&t=2729s',
    videoId: 'd5jJq3LN1tc',
    thumbnail: 'https://img.youtube.com/vi/d5jJq3LN1tc/hqdefault.jpg',
    duration: 'Long-form',
    publishedLabel: 'Featured conversation',
  },
  {
    id: 'episode-3',
    title: 'KCIC Podcast Episode 3',
    summary:
      'A discussion on climate finance, policy signals, and the opportunities opening for early-stage innovators.',
    youtubeUrl: 'https://www.youtube.com/watch?v=j-QZj3h8yt0',
    videoId: 'j-QZj3h8yt0',
    thumbnail: 'https://img.youtube.com/vi/j-QZj3h8yt0/hqdefault.jpg',
    duration: 'Watch now',
    publishedLabel: 'New release',
  },
  {
    id: 'episode-4',
    title: 'KCIC Podcast Episode 4',
    summary:
      'Stories from climate founders translating technical ideas into sustainable businesses with measurable local impact.',
    youtubeUrl: 'https://www.youtube.com/watch?v=67g_BWUEeBI&t=4s',
    videoId: '67g_BWUEeBI',
    thumbnail: 'https://img.youtube.com/vi/67g_BWUEeBI/hqdefault.jpg',
    duration: 'Watch now',
    publishedLabel: 'Founder story',
  },
  {
    id: 'episode-5',
    title: 'KCIC Podcast Episode 5',
    summary:
      'Practical reflections on scaling climate solutions across agriculture, energy, water, and circular economy sectors.',
    youtubeUrl: 'https://www.youtube.com/watch?v=IjAAAQ03XvA',
    videoId: 'IjAAAQ03XvA',
    thumbnail: 'https://img.youtube.com/vi/IjAAAQ03XvA/hqdefault.jpg',
    duration: 'Watch now',
    publishedLabel: 'Ecosystem update',
  },
];

export type SavedResource = {
  id: string;
  title: string;
  detail: string;
  icon: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  linkType: 'article' | 'story' | 'event' | 'podcast';
  linkId: string;
};

export type ContentType = 'article' | 'story' | 'event';

export const homeCategoryFilters = [
  { label: 'All', value: 'all' as const },
  { label: 'Reports', value: 'reports' as const, categories: ['Comprehensive Report', 'Market Analysis'] },
  { label: 'News', value: 'news' as const, categories: ['SME Story'] },
  { label: 'Policies', value: 'policies' as const, categories: ['Policy Brief'] },
  { label: 'Innovation', value: 'innovation' as const, categories: ['Market Analysis', 'Comprehensive Report'] },
];

export const insightFilters = [
  { label: 'All Insights', value: 'all' as const },
  { label: 'AgTech', value: 'agtech' as const, keywords: ['agri', 'solar', 'farm', 'irrigation'] },
  { label: 'Clean Energy', value: 'energy' as const, keywords: ['energy', 'renewable', 'solar', 'carbon'] },
];

export const librarySectorFilters = [
  { label: 'All Sectors', value: 'all' as const },
  { label: 'AgTech', value: 'AgTech' as const },
  { label: 'Renewable Energy', value: 'Renewable Energy' as const },
  { label: 'Waste Management', value: 'Waste Management' as const },
];

export const savedResources: SavedResource[] = [
  {
    id: 'climate-report-2024',
    title: '2024 Climate Investment Report',
    detail: 'PDF document, 2.4 MB',
    icon: 'description',
  },
  {
    id: 'webinar-solar',
    title: 'Webinar: Scaling Off-Grid Solar',
    detail: 'Video recording, 45 min',
    icon: 'play-circle',
  },
];

export const notifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New report published',
    body: 'The Future of Solar Irrigation in Arid Regions is now available.',
    time: '2h ago',
    linkType: 'article',
    linkId: 'solar-regions',
  },
  {
    id: 'notif-2',
    title: 'Event reminder',
    body: 'Green Financing Strategies for Startups starts tomorrow at 10:00 AM EAT.',
    time: '5h ago',
    linkType: 'event',
    linkId: 'green-financing',
  },
  {
    id: 'notif-3',
    title: 'New podcast episode',
    body: 'KCIC Podcast Episode 3 is ready to watch.',
    time: '1d ago',
    linkType: 'podcast',
    linkId: 'episode-3',
  },
  {
    id: 'notif-4',
    title: 'SME spotlight',
    body: 'Read how AgriSeed Innovations supports 10k farmers.',
    time: '2d ago',
    linkType: 'story',
    linkId: 'agriseed',
  },
];

export function bookmarkKey(type: ContentType | 'resource', id: string) {
  return `${type}:${id}`;
}

export type BookmarkType = ContentType | 'resource';

export type ResolvedBookmark = {
  key: string;
  type: BookmarkType;
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export function resolveBookmark(key: string): ResolvedBookmark | null {
  const separator = key.indexOf(':');
  if (separator === -1) return null;

  const type = key.slice(0, separator) as BookmarkType;
  const id = key.slice(separator + 1);

  if (type === 'article') {
    const article = getArticle(id);
    if (!article) return null;
    return {
      key,
      type,
      id,
      title: article.title,
      subtitle: `${article.category} · ${article.readTime}`,
      icon: 'article',
    };
  }

  if (type === 'story') {
    const story = getStory(id);
    if (!story) return null;
    return {
      key,
      type,
      id,
      title: story.title,
      subtitle: `${story.sector} · ${story.founder}`,
      icon: 'auto-stories',
    };
  }

  if (type === 'event') {
    const event = getEvent(id);
    if (!event) return null;
    return {
      key,
      type,
      id,
      title: event.title,
      subtitle: `${event.date} · ${event.location}`,
      icon: 'event',
    };
  }

  if (type === 'resource') {
    const resource = savedResources.find((item) => item.id === id);
    if (!resource) return null;
    return {
      key,
      type,
      id,
      title: resource.title,
      subtitle: resource.detail,
      icon: resource.icon as ResolvedBookmark['icon'],
    };
  }

  return null;
}

export function getArticle(id: string) {
  return articles.find((a) => a.id === id);
}

export function getStory(id: string) {
  return stories.find((s) => s.id === id);
}

export function getEvent(id: string) {
  return events.find((e) => e.id === id);
}

export function getPodcast(id: string) {
  return podcasts.find((p) => p.id === id);
}

export function filterArticlesByHomeCategory(
  items: Article[],
  filterValue: (typeof homeCategoryFilters)[number]['value']
) {
  if (filterValue === 'all') return items;
  const filter = homeCategoryFilters.find((f) => f.value === filterValue);
  if (!filter || !('categories' in filter)) return items;
  return items.filter((a) => filter.categories?.includes(a.category));
}

export function filterArticlesByInsight(
  items: Article[],
  filterValue: (typeof insightFilters)[number]['value']
) {
  if (filterValue === 'all') return items;
  const filter = insightFilters.find((f) => f.value === filterValue);
  if (!filter || !('keywords' in filter)) return items;
  return items.filter((a) => {
    const haystack = `${a.title} ${a.summary} ${a.category}`.toLowerCase();
    return filter.keywords?.some((k) => haystack.includes(k)) ?? false;
  });
}
