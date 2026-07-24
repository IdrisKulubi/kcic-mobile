import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchNews,
  fetchOpportunities,
  fetchProgrammes,
  type NewsArticle,
  type Opportunity,
  type Programme,
} from '@/lib/content-api';

type ContentContextValue = {
  articles: NewsArticle[];
  programmes: Programme[];
  opportunities: Opportunity[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [newsResult, programmesResult, opportunitiesResult] = await Promise.all([
        fetchNews(),
        fetchProgrammes(),
        fetchOpportunities(),
      ]);
      setArticles(newsResult.items);
      setProgrammes(programmesResult.items);
      setOpportunities(opportunitiesResult.items);
      setError(null);
    } catch {
      setError('Live KCIC content is unavailable. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  const value = useMemo(
    () => ({ articles, programmes, opportunities, loading, refreshing, error, refresh }),
    [articles, programmes, opportunities, loading, refreshing, error, refresh]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used within ContentProvider');
  return value;
}
