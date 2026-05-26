import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { openNotificationLink } from '@/lib/navigation';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, notificationRead, markNotificationRead, markAllNotificationsRead } =
    usePrototype();

  const handlePress = (id: string, linkType: string, linkId: string) => {
    markNotificationRead(id);
    router.back();
    setTimeout(() => openNotificationLink(linkType, linkId), 100);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable onPress={markAllNotificationsRead} hitSlop={8}>
          <Text style={styles.markAll}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll}>
        {notifications.map((n) => {
          const isRead = notificationRead.has(n.id);
          return (
            <Pressable
              key={n.id}
              style={[styles.row, !isRead && styles.rowUnread]}
              onPress={() => handlePress(n.id, n.linkType, n.linkId)}>
              <View style={[styles.iconWrap, !isRead && styles.iconUnread]}>
                <MaterialIcons name="notifications" size={20} color={isRead ? palette.slate : palette.forest} />
              </View>
              <View style={styles.body}>
                <Text style={[styles.rowTitle, !isRead && styles.rowTitleUnread]}>{n.title}</Text>
                <Text style={styles.rowBody} numberOfLines={2}>
                  {n.body}
                </Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
              {!isRead ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  title: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  markAll: {
    color: palette.limeDark,
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
    marginBottom: 10,
  },
  rowUnread: {
    borderColor: palette.lime,
    backgroundColor: '#FBFFF7',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.panel,
  },
  iconUnread: {
    backgroundColor: '#E9F7DE',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  rowTitleUnread: {
    fontWeight: '900',
  },
  rowBody: {
    color: palette.slate,
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.limeDark,
    marginTop: 6,
  },
});
