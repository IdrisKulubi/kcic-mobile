import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ProfileTheme } from '@/components/kcic/profile/profile-theme';
import { palette } from '@/components/kcic/ui';
import type { Event } from '@/data/kcic';
import { fonts } from '@/lib/typography';

type ProfileEventsSectionProps = {
  events: Event[];
  colors: ProfileTheme;
  onEventPress: (eventId: string) => void;
  onBrowsePress: () => void;
};

export function ProfileEventsSection({
  events,
  colors,
  onEventPress,
  onBrowsePress,
}: ProfileEventsSectionProps) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
          <MaterialIcons name="event" size={22} color={palette.green} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.ink }]}>No events registered</Text>
        <Text style={[styles.emptyCopy, { color: colors.muted }]}>
          RSVP to KCIC events and they will appear here.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onBrowsePress}
          style={({ pressed }) => [{ opacity: pressed ? 0.76 : 1 }]}>
          <Text style={[styles.emptyAction, { color: colors.accentGreen }]}>Browse events</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {events.map((event, index) => (
        <Pressable
          key={event.id}
          accessibilityRole="button"
          onPress={() => onEventPress(event.id)}
          style={({ pressed }) => [
            styles.row,
            {
              borderTopColor: colors.border,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Image source={{ uri: event.image }} style={styles.thumb} contentFit="cover" />
          <View style={styles.copy}>
            <Text style={[styles.typeLabel, { color: colors.accentGreen }]}>{event.type}</Text>
            <Text style={[styles.title, { color: colors.ink }]} numberOfLines={2}>
              {event.title}
            </Text>
            <Text style={[styles.meta, { color: colors.muted }]}>
              {event.date} · {event.time}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  typeLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  emptyCopy: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  emptyAction: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 4,
  },
});
