import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchMedia, type MediaItem } from '@/lib/media-api';

type MediaContextValue = {
  podcasts: MediaItem[];
  videos: MediaItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  source: 'youtube' | 'fallback' | null;
  refresh: () => Promise<void>;
  getItemById: (id: string) => MediaItem | undefined;
};

const MediaContext = createContext<MediaContextValue | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [podcasts, setPodcasts] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [source, setSource] = useState<'youtube' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchMedia();
      setPodcasts(data.podcasts);
      setVideos(data.videos);
      setSource(data.source);
      setError(null);
    } catch {
      setError('KCIC media is unavailable. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const getItemById = useCallback(
    (id: string) => [...podcasts, ...videos].find((item) => item.id === id),
    [podcasts, videos]
  );

  const value = useMemo(
    () => ({
      podcasts,
      videos,
      loading,
      refreshing,
      error,
      source,
      refresh,
      getItemById,
    }),
    [podcasts, videos, loading, refreshing, error, source, refresh, getItemById]
  );

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export function useMedia() {
  const value = useContext(MediaContext);
  if (!value) throw new Error('useMedia must be used within MediaProvider');
  return value;
}
