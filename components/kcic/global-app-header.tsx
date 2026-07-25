import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { useGlobalHeader } from '@/context/global-header-context';
import { usePrototype } from '@/context/prototype-context';
import { hapticLight } from '@/lib/haptics';
import { EXPLORE_HEADER_BAR_HEIGHT, EXPLORE_HEADER_BOTTOM_GAP } from '@/lib/use-collapsing-header-scroll';
import { fonts } from '@/lib/typography';

const headerThemes = {
  light: {
    surface: '#FFFFFF',
    ink: '#3F4042',
    muted: '#65676A',
    border: '#DFE0E1',
  },
  dark: {
    surface: '#202123',
    ink: '#F4F4F5',
    muted: '#B4B5B7',
    border: '#38393B',
  },
} as const;

export function GlobalAppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? headerThemes.dark : headerThemes.light;
  const { hasUnreadNotifications } = usePrototype();
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    headerStyle,
    handleSearchFocus,
  } = useGlobalHeader();

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.floatingHeader, { paddingTop: insets.top }, headerStyle]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            router.push('/profile');
          }}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}>
          <MaterialIcons name="person-outline" size={21} color={colors.ink} />
        </Pressable>
        <View
          style={[
            styles.headerSearchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <MaterialIcons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.headerSearchInput, { color: colors.ink }]}
            placeholder="Search programmes, insights..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              hapticLight();
              handleSearchFocus();
            }}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search KCIC content"
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => {
                hapticLight();
                clearSearch();
              }}>
              <MaterialIcons name="close" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}
          onPress={() => {
            hapticLight();
            router.push('/notifications');
          }}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}>
          <MaterialIcons name="notifications-none" size={21} color={colors.ink} />
          {hasUnreadNotifications ? (
            <View style={[styles.unreadDot, { borderColor: colors.surface }]} />
          ) : null}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 18,
    paddingBottom: EXPLORE_HEADER_BOTTOM_GAP,
  },
  topBar: {
    minHeight: EXPLORE_HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSearchBar: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSearchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 8,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brown,
    borderWidth: 1.5,
  },
});
