import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { palette } from '@/components/kcic/ui';

export default function AuthLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.shell }}>
        <ActivityIndicator color={palette.forest} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
