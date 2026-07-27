import * as SplashScreen from 'expo-splash-screen';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@/components/kcic/ui';

const splashVideo = require('@/assets/video/splash.mp4');
const MAX_SPLASH_MS = 12000;

export function IntroSplash({ onFinish }: { onFinish: () => void }) {
  const exitProgress = useSharedValue(0);
  const finishedRef = useRef(false);

  const finishSplash = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    exitProgress.value = withTiming(
      1,
      {
        duration: 320,
        easing: Easing.inOut(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      }
    );
  }, [exitProgress, onFinish]);

  const player = useVideoPlayer(splashVideo, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  useEffect(() => {
    const playToEnd = player.addListener('playToEnd', finishSplash);
    const statusChange = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') {
        console.warn('[IntroSplash] Video failed to load', error);
        finishSplash();
      }
    });
    const timeout = setTimeout(finishSplash, MAX_SPLASH_MS);

    return () => {
      playToEnd.remove();
      statusChange.remove();
      clearTimeout(timeout);
    };
  }, [finishSplash, player]);

  const handleFirstFrame = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exitProgress.value, [0, 1], [1, 0]),
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerStyle]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        onFirstFrameRender={handleFirstFrame}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: palette.shell,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
