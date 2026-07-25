import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';

function SkeletonBlock({
  style,
  pulse,
}: {
  style: object;
  pulse: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.42 + pulse.value * 0.36,
  }));

  return <Animated.View style={[styles.block, style, animatedStyle]} />;
}

export function ArticleDetailSkeleton() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  return (
    <View style={styles.root} accessibilityLabel="Loading article">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: windowHeight }]}>
          <LinearGradient
            colors={['#1A1B1D', '#242528', '#151617']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 16, 17, 0.55)', 'rgba(15, 16, 17, 0.88)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroCopy}>
            <SkeletonBlock pulse={pulse} style={styles.titleLinePrimary} />
            <SkeletonBlock pulse={pulse} style={styles.titleLineSecondary} />
            <SkeletonBlock pulse={pulse} style={styles.titleLineTertiary} />
            <SkeletonBlock pulse={pulse} style={styles.metaLine} />
            <SkeletonBlock pulse={pulse} style={styles.chevron} />
          </View>
        </View>

        <View style={styles.body}>
          <SkeletonBlock pulse={pulse} style={styles.excerptLine} />
          <SkeletonBlock pulse={pulse} style={styles.excerptLineWide} />
          <SkeletonBlock pulse={pulse} style={styles.paragraphLine} />
          <SkeletonBlock pulse={pulse} style={styles.paragraphLine} />
          <SkeletonBlock pulse={pulse} style={styles.paragraphLineShort} />
          <SkeletonBlock pulse={pulse} style={styles.paragraphLine} />
          <SkeletonBlock pulse={pulse} style={styles.paragraphLineMedium} />
        </View>
      </ScrollView>

      <View pointerEvents="none" style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <SkeletonBlock pulse={pulse} style={styles.toolbarIcon} />
        <View style={styles.toolbarActions}>
          <SkeletonBlock pulse={pulse} style={styles.toolbarIcon} />
          <SkeletonBlock pulse={pulse} style={styles.toolbarIcon} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#202123',
  },
  heroCopy: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 42,
    alignItems: 'center',
    gap: 10,
  },
  block: {
    backgroundColor: 'rgba(244, 244, 245, 0.22)',
  },
  titleLinePrimary: {
    width: '92%',
    height: 28,
    borderRadius: 8,
  },
  titleLineSecondary: {
    width: '78%',
    height: 28,
    borderRadius: 8,
  },
  titleLineTertiary: {
    width: '54%',
    height: 28,
    borderRadius: 8,
  },
  metaLine: {
    width: '48%',
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  chevron: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 10,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 12,
    backgroundColor: palette.shell,
  },
  excerptLine: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DDDEDF',
  },
  excerptLineWide: {
    width: '88%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E8E8E9',
  },
  paragraphLine: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8E8E9',
  },
  paragraphLineShort: {
    width: '72%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8E8E9',
  },
  paragraphLineMedium: {
    width: '90%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8E8E9',
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 244, 245, 0.2)',
  },
});
