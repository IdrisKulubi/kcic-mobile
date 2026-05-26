import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { openContent } from '@/lib/navigation';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { showRsvpSuccess } from '@/components/kcic/feedback';
import {
  AppScreen,
  Card,
  Pill,
  PrimaryButton,
  SectionTitle,
  TopBar,
  palette,
} from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import { events, librarySectorFilters, stories } from '@/data/kcic';

export default function LibraryScreen() {
  const router = useRouter();
  const { hasUnreadNotifications, toggleRsvp, isRsvped } = usePrototype();
  const [activeSector, setActiveSector] = useState(librarySectorFilters[0].value);

  const filteredStories = useMemo(() => {
    if (activeSector === 'all') return stories;
    return stories.filter((s) => s.sector === activeSector);
  }, [activeSector]);

  const handleRsvp = (eventId: string, eventTitle: string) => {
    const added = toggleRsvp(eventId);
    showRsvpSuccess(eventTitle, added);
  };

  return (
    <AppScreen>
      <TopBar
        hasUnread={hasUnreadNotifications}
        onPressNotifications={() => router.push('/notifications')}
        onPressAvatar={() => router.push('/profile')}
      />

      <Text style={styles.eyebrow}>Insights & Impact</Text>
      <Text style={styles.title}>SME Stories</Text>
      <Text style={styles.intro}>
        Discover entrepreneurs translating innovation into measurable sustainable growth.
      </Text>

      <View style={styles.filters}>
        {librarySectorFilters.map((filter, index) => (
          <Pill
            key={filter.value}
            label={filter.label}
            active={activeSector === filter.value}
            tone={index === 1 ? 'blue' : 'green'}
            onPress={() => setActiveSector(filter.value)}
          />
        ))}
      </View>

      {filteredStories.map((story) => (
        <Card
          key={story.id}
          style={styles.storyCard}
          onPress={() => openContent('story', story.id)}>
          <Image source={{ uri: story.image }} style={styles.storyImage} contentFit="cover" />
          <View style={styles.storyBody}>
            <View style={styles.storyMeta}>
              <Text style={styles.sector}>{story.sector}</Text>
              <Text style={styles.location}>{story.location}</Text>
            </View>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <View style={styles.impactBadge}>
              <MaterialIcons name="bolt" size={13} color={palette.blue} />
              <Text style={styles.impactText}>{story.impact}</Text>
            </View>
            <Text style={styles.summary} numberOfLines={4}>
              {story.summary}
            </Text>
            <View style={styles.founderRow}>
              <Text style={styles.founder}>{story.founder}</Text>
              <Text style={styles.readStory}>Read Story</Text>
            </View>
          </View>
        </Card>
      ))}

      <Card style={styles.eventsPanel}>
        <SectionTitle title="Upcoming Events" icon="calendar-month" />
        {events.map((event) => {
          const rsvped = isRsvped(event.id);
          return (
            <View key={event.id} style={styles.eventCard}>
              <Pressable onPress={() => openContent('event', event.id)}>
                <Image source={{ uri: event.image }} style={styles.eventImage} contentFit="cover" />
              </Pressable>
              <View style={styles.eventBody}>
                <Pill label={event.type} tone={event.type === 'Expo' ? 'cream' : 'green'} />
                <Text style={styles.eventTime}>
                  {event.date}, {event.time}
                </Text>
                <Pressable onPress={() => openContent('event', event.id)}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </Pressable>
                <Text style={styles.location}>{event.location}</Text>
                <PrimaryButton
                  label={rsvped ? "You're interested" : "I'm Interested"}
                  onPress={() => handleRsvp(event.id, event.title)}
                />
              </View>
            </View>
          );
        })}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: palette.ink,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    marginTop: 8,
  },
  intro: {
    color: palette.slate,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 18,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 24,
  },
  storyCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 22,
  },
  storyImage: {
    height: 172,
    width: '100%',
  },
  storyBody: {
    padding: 20,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  sector: {
    color: palette.limeDark,
    fontSize: 11,
    fontWeight: '800',
  },
  location: {
    color: palette.slate,
    fontSize: 12,
  },
  storyTitle: {
    color: palette.ink,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  impactBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF8FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
    marginBottom: 14,
  },
  impactText: {
    color: palette.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  summary: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 21,
  },
  founderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
    marginTop: 18,
    paddingTop: 16,
  },
  founder: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  readStory: {
    color: palette.limeDark,
    fontSize: 12,
    fontWeight: '900',
  },
  eventsPanel: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EBD9',
  },
  eventImage: {
    height: 162,
    width: '100%',
  },
  eventBody: {
    padding: 16,
    gap: 10,
    backgroundColor: palette.white,
  },
  eventTime: {
    color: palette.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  eventTitle: {
    color: palette.ink,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
  },
});
