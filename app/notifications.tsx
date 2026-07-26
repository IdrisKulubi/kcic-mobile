import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationItemCard } from '@/components/kcic/notification-item-card';
import { palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { hapticLight } from '@/lib/haptics';
import { openNotificationLink } from '@/lib/navigation';
import { fonts } from '@/lib/typography';

const notificationThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF0',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    grabber: '#C8C9CB',
    accentSoft: '#EDF8FC',
    markAll: palette.green,
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    surfaceAlt: '#292A2C',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    grabber: '#4A4B4D',
    accentSoft: '#1E2A33',
    markAll: palette.green,
  },
} as const;

export default function NotificationsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? notificationThemes.dark : notificationThemes.light;
  const { notifications, notificationRead, markNotificationRead, markAllNotificationsRead } =
    usePrototype();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !notificationRead.has(item.id)).length,
    [notificationRead, notifications]
  );

  const handlePress = (id: string, linkType: string, linkId: string) => {
    hapticLight();
    markNotificationRead(id);
    router.back();
    setTimeout(() => openNotificationLink(linkType, linkId), 100);
  };

  const handleMarkAllRead = () => {
    hapticLight();
    markAllNotificationsRead();
  };

  const handleClose = () => {
    hapticLight();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.sheetTop}>
        <View style={[styles.grabber, { backgroundColor: colors.grabber }]} />
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close notifications"
            hitSlop={8}
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.76 : 1,
              },
            ]}>
            <MaterialIcons name="close" size={20} color={colors.ink} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.ink }]}>Notifications</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                : 'You are all caught up'}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleMarkAllRead}
              hitSlop={8}
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
              <Text style={[styles.markAll, { color: colors.markAll }]}>Mark all</Text>
            </Pressable>
          ) : (
            <View style={styles.markAllSpacer} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
              <MaterialIcons name="notifications-none" size={28} color={palette.blue} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.ink }]}>No notifications yet</Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              Updates about insights, events, and media from KCIC will appear here.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.groupedList,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
            {notifications.map((notification, index) => (
              <NotificationItemCard
                key={notification.id}
                notification={notification}
                isRead={notificationRead.has(notification.id)}
                isDark={isDark}
                showDivider={index < notifications.length - 1}
                colors={{
                  surface: colors.surface,
                  ink: colors.ink,
                  muted: colors.muted,
                  border: colors.border,
                  accentSoft: colors.accentSoft,
                  surfaceAlt: colors.surfaceAlt,
                }}
                onPress={() =>
                  handlePress(notification.id, notification.linkType, notification.linkId)
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  sheetTop: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    paddingTop: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  markAll: {
    fontFamily: fonts.bold,
    fontSize: 13,
    marginTop: 8,
  },
  markAllSpacer: {
    width: 52,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  groupedList: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
});
