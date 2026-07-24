import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, Card, SectionTitle, TopBar, palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { events as seedEvents } from '@/data/kcic';
import { openContent } from '@/lib/navigation';
import { fonts } from '@/lib/typography';

const dummyEvents = [
  ...seedEvents,
  {
    id: 'climate-pitch-day',
    type: 'Pitch Day',
    title: 'KCIC Climate Venture Pitch Day',
    date: 'Wed, Nov 12',
    time: '2:00 PM EAT',
    location: 'Nairobi Garage',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'circular-economy-forum',
    type: 'Forum',
    title: 'Circular Economy Innovation Forum',
    date: 'Fri, Nov 21',
    time: '9:30 AM EAT',
    location: 'Hybrid',
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f39c4662?auto=format&fit=crop&w=900&q=80',
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const { hasUnreadNotifications } = usePrototype();

  return (
    <AppScreen>
      <TopBar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.intro}>
          Workshops, expos, and networking sessions for climate innovators. Placeholder listings for now.
        </Text>
      </View>

      <Card style={styles.section}>
        <SectionTitle title="Upcoming" />
        {dummyEvents.map((event, index) => (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            onPress={() => openContent('event', event.id)}
            style={({ pressed }) => [
              styles.eventRow,
              index < dummyEvents.length - 1 ? styles.eventRowBorder : null,
              { opacity: pressed ? 0.76 : 1 },
            ]}>
            <Image source={{ uri: event.image }} style={styles.eventImage} contentFit="cover" />
            <View style={styles.eventCopy}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.eventMeta}>
                <MaterialIcons name="schedule" size={13} color={palette.slate} />
                <Text style={styles.eventMetaText}>
                  {event.date} · {event.time}
                </Text>
              </View>
              <View style={styles.eventMeta}>
                <MaterialIcons name="location-on" size={13} color={palette.slate} />
                <Text style={styles.eventMetaText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={palette.slate} />
          </Pressable>
        ))}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 36,
    color: palette.ink,
    letterSpacing: -0.4,
  },
  intro: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: palette.slate,
    maxWidth: 360,
  },
  section: {
    marginBottom: 22,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  eventRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E9',
  },
  eventImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: palette.panel,
  },
  eventCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  eventType: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: palette.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  eventTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
    color: palette.ink,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: palette.slate,
  },
});
