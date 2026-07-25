import { usePathname, useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EXPLORE_HEADER_BAR_HEIGHT,
  EXPLORE_HEADER_BOTTOM_GAP,
  useCollapsingHeaderScroll,
} from '@/lib/use-collapsing-header-scroll';

type GlobalHeaderContextValue = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  onScroll: ReturnType<typeof useCollapsingHeaderScroll>['onScroll'];
  headerStyle: AnimatedStyle<ViewStyle>;
  contentTopPadding: number;
  handleSearchFocus: () => void;
};

const GlobalHeaderContext = createContext<GlobalHeaderContextValue | null>(null);

function isExploreRoute(pathname: string) {
  return pathname === '/explore' || pathname.endsWith('/explore');
}

export function GlobalHeaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedSearchQuery = searchQuery.trim();
  const isSearching = trimmedSearchQuery.length > 0;
  const isExploreTab = isExploreRoute(pathname);
  const headerHideDistance = insets.top + EXPLORE_HEADER_BAR_HEIGHT + EXPLORE_HEADER_BOTTOM_GAP + 12;
  const headerLocked = isSearching && isExploreTab;
  const { onScroll, headerStyle } = useCollapsingHeaderScroll(
    headerLocked,
    headerHideDistance,
    pathname
  );
  const contentTopPadding = insets.top + EXPLORE_HEADER_BAR_HEIGHT + EXPLORE_HEADER_BOTTOM_GAP;

  const clearSearch = useCallback(() => setSearchQuery(''), []);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const handleSearchFocus = useCallback(() => {
    if (!isExploreRoute(pathnameRef.current)) {
      router.push('/explore');
    }
  }, [router]);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      clearSearch,
      isSearching,
      onScroll,
      headerStyle,
      contentTopPadding,
      handleSearchFocus,
    }),
    [
      clearSearch,
      contentTopPadding,
      handleSearchFocus,
      headerStyle,
      isSearching,
      onScroll,
      searchQuery,
    ]
  );

  return <GlobalHeaderContext.Provider value={value}>{children}</GlobalHeaderContext.Provider>;
}

export function useGlobalHeader() {
  const context = useContext(GlobalHeaderContext);
  if (!context) {
    throw new Error('useGlobalHeader must be used within GlobalHeaderProvider');
  }
  return context;
}

export function useOptionalGlobalHeader() {
  return useContext(GlobalHeaderContext);
}
