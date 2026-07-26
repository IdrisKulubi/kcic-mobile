import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/kcic/ui';
import type { AppNotification } from '@/data/kcic';
import { fonts } from '@/lib/typography';

type NotificationColors = {
  surface: string;
  ink: string;
  muted: string;
  border: string;
  accentSoft: string;
  surfaceAlt: string;
};

type NotificationItemCardProps = {
  notification: AppNotification;
  isRead: boolean;
  isDark: boolean;
  colors: NotificationColors;
  showDivider?: boolean;
  onPress: () => void;
};

function notificationMeta(linkType: AppNotification['linkType']) {
  if (linkType === 'article') {
    return {
      icon: 'article' as const,
      label: 'Insight',
      accent: palette.blue,
      softLight: '#EDF8FC',
      softDark: '#1A2D36',
    };
  }
  if (linkType === 'event') {
    return {
      icon: 'event' as const,
      label: 'Event',
      accent: palette.brown,
      softLight: '#FFF0EB',
      softDark: '#3A2620',
    };
  }
  if (linkType === 'podcast') {
    return {
      icon: 'podcasts' as const,
      label: 'Media',
      accent: palette.green,
      softLight: '#EEF8E2',
      softDark: '#243018',
    };
  }
  return {
    icon: 'auto-stories' as const,
    label: 'Story',
    accent: palette.green,
    softLight: '#EEF8E2',
    softDark: '#243018',
  };
}

export function NotificationItemCard({
  notification,
  isRead,
  isDark,
  colors,
  showDivider = false,
  onPress,
}: NotificationItemCardProps) {
  const meta = notificationMeta(notification.linkType);
  const iconBackground = isRead
    ? colors.surfaceAlt
    : isDark
      ? meta.softDark
      : meta.softLight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.body}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider
          ? {
              borderBottomColor: colors.border,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }
          : null,
        { opacity: pressed ? 0.84 : 1 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
        <MaterialIcons
          name={meta.icon}
          size={22}
          color={isRead ? colors.muted : meta.accent}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.labelRow}>
          <View style={styles.typeRow}>
            {!isRead ? <View style={styles.unreadDot} /> : null}
            <Text style={[styles.typeLabel, { color: palette.green }]} numberOfLines={1}>
              {meta.label}
            </Text>
          </View>
          <Text style={[styles.time, { color: colors.muted }]}>{notification.time}</Text>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontFamily: isRead ? fonts.semibold : fonts.bold,
            },
          ]}
          numberOfLines={2}>
          {notification.title}
        </Text>
        <Text style={[styles.body, { color: colors.muted }]} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.green,
  },
  typeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 11,
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
