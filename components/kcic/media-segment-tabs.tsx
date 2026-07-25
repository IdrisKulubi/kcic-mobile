import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/kcic/ui';
import { fonts } from '@/lib/typography';

export type MediaSegment = 'podcasts' | 'videos';

type MediaSegmentTabsProps = {
  active: MediaSegment;
  onChange: (segment: MediaSegment) => void;
  colors: {
    ink: string;
    muted: string;
    border: string;
    tabActive: string;
  };
};

export function MediaSegmentTabs({ active, onChange, colors }: MediaSegmentTabsProps) {
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      {(
        [
          { key: 'podcasts' as const, label: 'PODCASTS' },
          { key: 'videos' as const, label: 'VIDEOS' },
        ] as const
      ).map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={styles.tab}>
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.tabActive : colors.ink },
              ]}>
              {tab.label}
            </Text>
            {isActive ? (
              <View style={[styles.indicator, { backgroundColor: colors.tabActive }]} />
            ) : (
              <View style={styles.indicatorSpacer} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    borderRadius: 2,
  },
  indicatorSpacer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
  },
});
