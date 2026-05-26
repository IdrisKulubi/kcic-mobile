import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { HeaderBackButton } from '@/components/kcic/header-back';
import { palette } from '@/components/kcic/ui';

export const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerTintColor: palette.forest,
  headerStyle: { backgroundColor: palette.shell },
  headerShadowVisible: false,
  headerBackVisible: false,
  headerLeft: () => <HeaderBackButton />,
};

export const modalStackScreenOptions: NativeStackNavigationOptions = {
  ...defaultStackScreenOptions,
  headerLeft: () => <HeaderBackButton label="Close" />,
};
