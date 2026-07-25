import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/auth-context';
import { fetchSavedKeys, isSavedSyncError, toggleSavedKey } from '@/lib/saved-api';
import { toast } from '@/lib/toast';

type BookmarksContextValue = {
  bookmarks: Set<string>;
  loading: boolean;
  syncing: boolean;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  refreshBookmarks: () => Promise<void>;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refreshBookmarks = useCallback(async () => {
    if (status !== 'authenticated') {
      setBookmarks(new Set());
      return;
    }

    setLoading(true);
    try {
      const keys = await fetchSavedKeys();
      setBookmarks(new Set(keys));
    } catch (error) {
      if (!isSavedSyncError(error)) {
        toast.error('Saved items unavailable', 'Could not load your saved items. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setBookmarks(new Set());
      setLoading(false);
      return;
    }

    void refreshBookmarks();
  }, [refreshBookmarks, status]);

  const toggleBookmark = useCallback((key: string) => {
    let nextSaved = false;

    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        nextSaved = false;
      } else {
        next.add(key);
        nextSaved = true;
      }
      return next;
    });

    if (status !== 'authenticated') return;

    setSyncing(true);
    void toggleSavedKey(key)
      .then((result) => {
        setBookmarks((prev) => {
          const next = new Set(prev);
          if (result.saved) next.add(key);
          else next.delete(key);
          return next;
        });
      })
      .catch((error) => {
        if (isSavedSyncError(error)) return;

        setBookmarks((prev) => {
          const next = new Set(prev);
          if (nextSaved) next.delete(key);
          else next.add(key);
          return next;
        });
        toast.error('Could not update saved item', 'Your change was not saved. Please try again.');
      })
      .finally(() => {
        setSyncing(false);
      });
  }, [status]);

  const isBookmarked = useCallback((key: string) => bookmarks.has(key), [bookmarks]);

  const value = useMemo(
    () => ({
      bookmarks,
      loading,
      syncing,
      toggleBookmark,
      isBookmarked,
      refreshBookmarks,
    }),
    [bookmarks, isBookmarked, loading, refreshBookmarks, syncing, toggleBookmark]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
