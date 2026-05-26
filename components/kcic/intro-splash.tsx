import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { logo, palette } from '@/components/kcic/ui';

export function IntroSplash({ onFinish }: { onFinish: () => void }) {
  const progress = useSharedValue(0);
  const logoProgress = useSharedValue(0);
  const wordProgress = useSharedValue(0);
  const exitProgress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    logoProgress.value = withDelay(
      120,
      withTiming(1, {
        duration: 820,
        easing: Easing.out(Easing.exp),
      })
    );
    wordProgress.value = withDelay(
      680,
      withTiming(1, {
        duration: 640,
        easing: Easing.out(Easing.cubic),
      })
    );
    exitProgress.value = withDelay(
      2200,
      withTiming(
        1,
        {
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
        },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        }
      )
    );
  }, [exitProgress, logoProgress, onFinish, progress, wordProgress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exitProgress.value, [0, 1], [1, 0]),
    transform: [
      {
        scale: interpolate(exitProgress.value, [0, 1], [1, 1.04]),
      },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.72, 1]),
      },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(logoProgress.value, [0, 0.28, 1], [0, 1, 1]),
    transform: [
      {
        scale: interpolate(logoProgress.value, [0, 1], [0.88, 1]),
      },
      {
        translateY: interpolate(logoProgress.value, [0, 1], [18, 0]),
      },
    ],
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wordProgress.value, [0, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(wordProgress.value, [0, 1], [16, 0]),
      },
    ],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: interpolate(wordProgress.value, [0, 1], [0.12, 1]),
      },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.halo, styles.haloLime, haloStyle]} />
        <Animated.View style={[styles.halo, styles.haloBlue, haloStyle]} />
      </View>

      <Animated.View style={[styles.brandLockup, logoStyle]}>
        <View style={styles.logoDisc}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>
        <Text style={styles.appName}>KCIC Climate Hub</Text>
      </Animated.View>

      <Animated.View style={[styles.copyBlock, wordStyle]}>
        <Animated.View style={[styles.rule, lineStyle]} />
        <Text style={styles.tagline}>Climate innovation. Enterprise. Impact.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.shell,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
  },
  haloLime: {
    width: 420,
    height: 420,
    top: -110,
    right: -180,
    backgroundColor: '#DFF5CE',
  },
  haloBlue: {
    width: 360,
    height: 360,
    bottom: -140,
    left: -150,
    backgroundColor: '#D7F3FA',
  },
  brandLockup: {
    alignItems: 'center',
    paddingHorizontal: 34,
  },
  logoDisc: {
    width: 188,
    height: 188,
    borderRadius: 94,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFFFC',
    borderWidth: 1,
    borderColor: '#E3EEDC',
    boxShadow: '0px 20px 40px rgba(0, 107, 69, 0.13)',
    elevation: 8,
  },
  logo: {
    width: 142,
    height: 112,
  },
  appName: {
    marginTop: 32,
    color: palette.ink,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0,
  },
  copyBlock: {
    position: 'absolute',
    bottom: 82,
    left: 28,
    right: 28,
    alignItems: 'center',
    gap: 18,
  },
  rule: {
    width: 112,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.lime,
  },
  tagline: {
    color: palette.forest,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
});
