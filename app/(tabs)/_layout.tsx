import { useRouter } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  GlassTabBar,
  GlassTabButton,
  TabBarMinimizeProvider,
  type GlassTabItem,
} from 'expo-glass-tabs';

import { AskKcicFab } from '@/components/kcic/ask-kcic-fab';
import { GlobalAppHeader } from '@/components/kcic/global-app-header';
import { palette } from '@/components/kcic/ui';
import { GlobalHeaderProvider } from '@/context/global-header-context';
import { MediaPlayerProvider } from '@/context/media-player-context';
import { TAB_BAR_FLOAT_OFFSET } from '@/lib/tab-bar-layout';

const TAB_ITEMS: (GlassTabItem & { href: string })[] = [
  { name: 'explore', href: '/explore', label: 'Explore', icon: 'safari.fill' },
  { name: 'index', href: '/', label: 'For You', icon: 'sparkles' },
  { name: 'podcasts', href: '/podcasts', label: 'Media', icon: 'play.rectangle.fill' },
  { name: 'saved', href: '/saved', label: 'Saved', icon: 'bookmark.fill' },
  { name: 'events', href: '/events', label: 'Events', icon: 'calendar' },
];

export default function TabLayout() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const glassTheme = {
    activeTint: palette.green,
    inactiveTint: isDark ? '#B8B9BB' : palette.slate,
    highlight: 'rgba(128, 199, 56, 0.16)',
    glassTint: isDark ? 'rgba(28, 29, 31, 0.76)' : 'rgba(255, 255, 255, 0.55)',
    solidFallback: isDark ? 'rgba(28, 29, 31, 0.96)' : 'rgba(255, 255, 255, 0.88)',
  };

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? '#151617' : palette.shell,
        }}>
        <ActivityIndicator color={palette.green} />
      </View>
    );
  }

  return (
    <TabBarMinimizeProvider>
      <GlobalHeaderProvider>
        <MediaPlayerProvider>
          <View style={{ flex: 1, backgroundColor: isDark ? '#151617' : palette.shell }}>
          <Tabs>
            <TabSlot style={{ height: '100%' }} />
            <TabList asChild>
              <GlassTabBar
                theme={glassTheme}
                floatOffset={TAB_BAR_FLOAT_OFFSET}
                haptics
                onIndexSelected={(index) => router.navigate(TAB_ITEMS[index].href as never)}>
                {TAB_ITEMS.map(({ href, ...item }, index) => (
                  <TabTrigger key={item.name} name={item.name} href={href as never} asChild>
                    <GlassTabButton item={item} index={index} />
                  </TabTrigger>
                ))}
              </GlassTabBar>
            </TabList>
          </Tabs>
          <GlobalAppHeader />
          <AskKcicFab />
        </View>
        </MediaPlayerProvider>
      </GlobalHeaderProvider>
    </TabBarMinimizeProvider>
  );
}
