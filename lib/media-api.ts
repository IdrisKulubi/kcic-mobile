import { apiFetch } from '@/lib/api-client';

export type MediaItemKind = 'podcast' | 'video';

export type MediaItem = {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  youtubeUrl: string;
  kind: MediaItemKind;
};

export type MediaListResponse = {
  podcasts: MediaItem[];
  videos: MediaItem[];
  source: 'youtube' | 'fallback';
};

export function fetchMedia() {
  return apiFetch<MediaListResponse>('/api/content/media');
}

export function getMediaItemById(
  podcasts: MediaItem[],
  videos: MediaItem[],
  id: string
): MediaItem | undefined {
  return [...podcasts, ...videos].find((item) => item.id === id);
}
