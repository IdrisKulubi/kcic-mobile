import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { palette } from '@/components/kcic/ui';
import type { SavedFilter } from '@/lib/resolve-saved-items';
import { fonts } from '@/lib/typography';

const filterOptions: {
  key: SavedFilter;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { key: 'all', label: 'All', icon: 'bookmark' },
  { key: 'insights', label: 'Insights', icon: 'article' },
  { key: 'programmes', label: 'Programmes', icon: 'hub' },
  { key: 'opportunities', label: 'Opportunities', icon: 'work-outline' },
  { key: 'media', label: 'Media', icon: 'podcasts' },
  { key: 'more', label: 'More', icon: 'more-horiz' },
];

type SavedFilterChipsProps = {
  active: SavedFilter;
  onChange: (filter: SavedFilter) => void;
  counts: Record<SavedFilter, number>;
  colors: {
    surface: string;
    ink: string;
    muted: string;
    border: string;
    activeText: string;
  };
};

export function SavedFilterChips({ active, onChange, counts, colors }: SavedFilterChipsProps) {
  const visibleFilters = filterOptions.filter((filter) => filter.key === 'all' || counts[filter.key] > 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
      accessibilityRole="tablist">
      {visibleFilters.map((filter) => {
        const isActive = active === filter.key;
        return (
          <Pressable
            key={filter.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(filter.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive ? palette.green : colors.surface,
                borderColor: isActive ? palette.green : colors.border,
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <MaterialIcons
              name={filter.icon}
              size={17}
              color={isActive ? colors.activeText : colors.muted}
            />
            <Text style={[styles.label, { color: isActive ? colors.activeText : colors.ink }]}>
              {filter.label}
              {filter.key !== 'all' ? ` (${counts[filter.key]})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 9,
    paddingRight: 18,
    paddingBottom: 3,
    marginBottom: 16,
  },
  chip: {
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
});
