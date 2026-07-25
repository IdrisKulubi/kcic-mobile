import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { useGlobalHeader } from '@/context/global-header-context';
import { TAB_SCREEN_BOTTOM_INSET } from '@/lib/tab-bar-layout';
import { fonts } from '@/lib/typography';

const eventsThemes = {
  light: {
    background: '#F5F5F6',
    surface: '#FFFFFF',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
    accentSoft: '#EDF8FC',
  },
  dark: {
    background: '#151617',
    surface: '#202123',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
    accentSoft: '#1E2A33',
  },
} as const;

export default function EventsScreen() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? eventsThemes.dark : eventsThemes.light;
  const { onScroll, contentTopPadding } = useGlobalHeader();

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentTopPadding, paddingBottom: TAB_SCREEN_BOTTOM_INSET + 72 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Text style={[styles.title, { color: colors.ink }]}>Events</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Workshops, expos, and networking sessions for climate innovators.
        </Text>

        <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}>
            <MaterialIcons name="event-busy" size={30} color={palette.blue} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.ink }]}>No upcoming events</Text>
          <Text style={[styles.emptyBody, { color: colors.muted }]}>
            There are no events scheduled right now. Check back soon for KCIC workshops, pitch days,
            and networking sessions.
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 38,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 340,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    maxWidth: 300,
  },
});
