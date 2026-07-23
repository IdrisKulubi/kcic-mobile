import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { IntroSplash } from '@/components/kcic/intro-splash';
import { ToastProvider } from '@/components/kcic/toast-provider';
import { AuthProvider } from '@/context/auth-context';
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
            title: 'Notifications',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ask"
          options={{ ...modalStackScreenOptions, presentation: 'modal', title: 'Ask KCIC', headerShown: true }}
        />
        <Stack.Screen name="library" options={{ title: 'Library', headerShown: true }} />
        <Stack.Screen name="content/[type]/[id]" options={{ title: 'Insight', headerShown: true }} />
        <Stack.Screen
          name="settings/[slug]"
          options={{ ...modalStackScreenOptions, presentation: 'modal', title: 'Settings', headerShown: true }}
        />
      </Stack>
      <StatusBar style="dark" />
      {showIntro ? <IntroSplash onFinish={handleIntroFinish} /> : null}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PrototypeProvider>
        <ToastProvider>
          <AuthProvider>
            <RootNavigation />
          </AuthProvider>
        </ToastProvider>
      </PrototypeProvider>
    </GestureHandlerRootView>
  );
}
