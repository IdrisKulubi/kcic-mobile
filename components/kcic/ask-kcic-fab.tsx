import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useTabBarMinimized } from 'expo-glass-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import {
  GLASS_TAB_BAR_EXPANDED,
  GLASS_TAB_BAR_MARGIN,
  GLASS_TAB_BAR_MINIMIZED,
  TAB_BAR_FLOAT_OFFSET,
} from '@/lib/tab-bar-layout';
import { openAskKcic } from '@/lib/navigation';

const FAB_SIZE = 56;
const FAB_EXPANDED_WIDTH = 156;

export function AskKcicFab() {
  const insets = useSafeAreaInsets();
  const { appSessionReady } = usePrototype();
  const tabBarMinimized = useTabBarMinimized();
  const expand = useSharedValue(0);
  const entrance = useSharedValue(0);

  useEffect(() => {
    if (!appSessionReady) return;

    entrance.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });

    expand.value = withDelay(
      280,
      withSequence(
        withTiming(1, {
          duration: 520,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          2200,
          withTiming(0, {
            duration: 480,
            easing: Easing.inOut(Easing.cubic),
          })
        )
      )
    );
  }, [appSessionReady, entrance, expand]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(entrance.value, [0, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(entrance.value, [0, 1], [18, 0]),
      },
      {
        scale: interpolate(entrance.value, [0, 1], [0.85, 1]),
      },
    ],
    width: interpolate(expand.value, [0, 1], [FAB_SIZE, FAB_EXPANDED_WIDTH]),
    bottom:
      interpolate(tabBarMinimized.value, [0, 1], [GLASS_TAB_BAR_EXPANDED, GLASS_TAB_BAR_MINIMIZED]) +
      GLASS_TAB_BAR_MARGIN +
      TAB_BAR_FLOAT_OFFSET +
      Math.max(insets.bottom, 10) +
      10,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0, 0.25, 1], [0, 0, 1]),
    maxWidth: interpolate(expand.value, [0, 1], [0, 96]),
    marginLeft: interpolate(expand.value, [0, 1], [0, 4]),
    transform: [
      {
        translateX: interpolate(expand.value, [0, 1], [8, 0]),
      },
    ],
  }));

  const handlePress = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openAskKcic();
  };

  return (
    <Animated.View pointerEvents="box-none" style={[styles.host, containerStyle]}>
      <Pressable
        onPress={handlePress}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Ask KCIC">
        <MaterialIcons name="auto-awesome" size={24} color={palette.white} />
        <Animated.View style={[styles.labelWrap, labelStyle]}>
          <Text style={styles.label} numberOfLines={1}>
            Ask KCIC
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    right: 18,
    zIndex: 50,
    elevation: 12,
    shadowColor: '#1D3D2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  fab: {
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: palette.lime,
    borderWidth: 1,
    borderColor: palette.limeDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  labelWrap: {
    overflow: 'hidden',
  },
  label: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
