import { Pressable, StyleSheet, Text, View, type ReactNode } from 'react-native';

import type { ProfileTheme } from '@/components/kcic/profile/profile-theme';
import { fonts } from '@/lib/typography';

type ProfileSectionProps = {
  title: string;
  action?: string;
  onAction?: () => void;
  colors: ProfileTheme;
  children: ReactNode;
};

export function ProfileSection({ title, action, onAction, colors, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
        {action && onAction ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
            <Text style={[styles.action, { color: colors.accentGreen }]}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
  },
  action: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
