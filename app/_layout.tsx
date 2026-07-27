import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { IntroSplash } from '@/components/kcic/intro-splash';
import { ToastProvider } from '@/components/kcic/toast-provider';
import { AuthProvider } from '@/context/auth-context';
import { BookmarksProvider } from '@/context/bookmarks-context';
import { ContentProvider } from '@/context/content-context';
import { MediaProvider } from '@/context/media-context';
import { MediaPlayerProvider } from '@/context/media-player-context';
import { PrototypeProvider, usePrototype } from '@/context/prototype-context';
import { defaultStackScreenOptions, modalStackScreenOptions } from '@/lib/stack-options';

WebBrowser.maybeCompleteAuthSession();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const [showIntro, setShowIntro] = useState(true);
  const { markAppSessionReady } = usePrototype();

  const handleIntroFinish = useCallback(() => {
    setShowIntro(false);
    markAppSessionReady();
  }, [markAppSessionReady]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={defaultStackScreenOptions}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="search"
          options={{ ...modalStackScreenOptions, presentation: 'modal', title: 'Search', headerShown: true }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            ...modalStackScreenOptions,
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="library" options={{ title: 'Library', headerShown: true }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="content/[type]/[id]" options={{ title: 'Insight', headerShown: true }} />
        <Stack.Screen
          name="settings/[slug]"
          options={{ ...modalStackScreenOptions, presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <StatusBar style="dark" />
      {showIntro ? <IntroSplash onFinish={handleIntroFinish} /> : null}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => undefined);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PrototypeProvider>
        <ToastProvider>
          <AuthProvider>
            <BookmarksProvider>
              <ContentProvider>
                <MediaProvider>
                  <MediaPlayerProvider>
                    <RootNavigation />
                  </MediaPlayerProvider>
                </MediaProvider>
              </ContentProvider>
            </BookmarksProvider>
          </AuthProvider>
        </ToastProvider>
      </PrototypeProvider>
    </GestureHandlerRootView>
  );
}
