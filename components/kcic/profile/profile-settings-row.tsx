import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTheme } from '@/components/kcic/profile/profile-theme';
import { fonts } from '@/lib/typography';

type ProfileSettingsRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  colors: ProfileTheme;
  destructive?: boolean;
  showChevron?: boolean;
  isFirst?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

export function ProfileSettingsRow({
  icon,
  title,
  subtitle,
  colors,
  destructive = false,
  showChevron = true,
  isFirst = false,
  onPress,
  rightElement,
}: ProfileSettingsRowProps) {
  const titleColor = destructive ? colors.danger : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderTopColor: colors.border,
          borderTopWidth: isFirst ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed && onPress ? 0.76 : 1,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={destructive ? colors.danger : colors.muted}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightElement ?? (showChevron && onPress ? (
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
