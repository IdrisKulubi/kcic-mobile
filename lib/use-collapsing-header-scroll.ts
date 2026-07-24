import {
  MINIMIZE_SPRING,
  setMinimized,
  useMinimizeState,
} from 'expo-glass-tabs/build/minimize-context';
import { useEffect } from 'react';
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export const EXPLORE_HEADER_BAR_HEIGHT = 58;
export const EXPLORE_HEADER_BOTTOM_GAP = 8;

export function useCollapsingHeaderScroll(locked = false, hideDistance = EXPLORE_HEADER_BAR_HEIGHT + 10) {
  const minimizeState = useMinimizeState();
  const headerProgress = useSharedValue(0);
  const previousY = useSharedValue(0);
  const lockedValue = useSharedValue(locked ? 1 : 0);
  const hideDistanceValue = useSharedValue(hideDistance);

  useEffect(() => {
    hideDistanceValue.value = hideDistance;
  }, [hideDistance, hideDistanceValue]);

  useEffect(() => {
    lockedValue.value = locked ? 1 : 0;
    if (locked) {
      headerProgress.value = withSpring(0, MINIMIZE_SPRING);
    }
  }, [headerProgress, locked, lockedValue]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxY = Math.max(event.contentSize.height - event.layoutMeasurement.height, 0);
      const y = Math.min(Math.max(event.contentOffset.y, 0), maxY);
      const dy = y - previousY.value;
      previousY.value = y;

      if (y < 24) {
        setMinimized(minimizeState, 0);
      } else if (dy > 3) {
        setMinimized(minimizeState, 1);
      } else if (dy < -3) {
        setMinimized(minimizeState, 0);
      }

      if (lockedValue.value === 1) return;

      if (y < 24) {
        headerProgress.value = withSpring(0, MINIMIZE_SPRING);
      } else if (dy > 3) {
        headerProgress.value = withSpring(1, MINIMIZE_SPRING);
      } else if (dy < -3) {
        headerProgress.value = withSpring(0, MINIMIZE_SPRING);
      }
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const hiddenOffset = -hideDistanceValue.value;

    return {
      transform: [
        {
          translateY: interpolate(headerProgress.value, [0, 1], [0, hiddenOffset], Extrapolation.CLAMP),
        },
      ],
      opacity: interpolate(headerProgress.value, [0, 0.45, 1], [1, 0, 0], Extrapolation.CLAMP),
    };
  });

  return { onScroll, headerStyle };
}
