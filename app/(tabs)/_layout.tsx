import { useRouter } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger } from 'expo-router/ui';
import { View } from 'react-native';
import {
  GlassTabBar,
  GlassTabButton,
  TabBarMinimizeProvider,
  renderFadingTabScreen,
  type GlassTabItem,
} from 'expo-glass-tabs';

import { AskKcicFab } from '@/components/kcic/ask-kcic-fab';
import { palette } from '@/components/kcic/ui';
import { TAB_BAR_FLOAT_OFFSET } from '@/lib/tab-bar-layout';

const TAB_ITEMS: (GlassTabItem & { href: string })[] = [
  { name: 'explore', href: '/explore', label: 'Explore', icon: 'safari.fill' },
  { name: 'index', href: '/', label: 'For You', icon: 'sparkles' },
  { name: 'podcasts', href: '/podcasts', label: 'Media', icon: 'play.rectangle.fill' },
  { name: 'saved', href: '/saved', label: 'Saved', icon: 'bookmark.fill' },
  { name: 'profile', href: '/profile', label: 'Profile', icon: 'person.crop.circle.fill' },
];

const glassTheme = {
  activeTint: palette.green,
  inactiveTint: palette.slate,
  highlight: 'rgba(128, 199, 56, 0.14)',
  glassTint: 'rgba(255, 255, 255, 0.55)',
  solidFallback: 'rgba(255, 255, 255, 0.82)',
};

export default function TabLayout() {
  const router = useRouter();

  return (
    <TabBarMinimizeProvider>
      <View style={{ flex: 1 }}>
        <Tabs>
          <TabSlot style={{ height: '100%' }} renderFn={renderFadingTabScreen} />
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
        <AskKcicFab />
      </View>
    </TabBarMinimizeProvider>
  );
}
