import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { authThemes } from '@/components/kcic/auth/auth-theme';
import { palette } from '@/components/kcic/ui';

export default function AuthLayout() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? authThemes.dark : authThemes.light;
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.shell,
        }}>
        <ActivityIndicator color={palette.green} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
