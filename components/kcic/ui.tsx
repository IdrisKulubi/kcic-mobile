import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useMinimizeOnScroll } from 'expo-glass-tabs';
import { ReactNode } from 'react';
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TAB_SCREEN_BOTTOM_INSET } from '@/lib/tab-bar-layout';

export const palette = {
  green: '#80C738',
  gray: '#8B8D90',
  white: '#FFFFFF',
  blue: '#00ADDD',
  brown: '#E97451',
  /** @deprecated Use palette.green */
  lime: '#80C738',
  /** @deprecated Use palette.green */
  limeDark: '#6BA82E',
  /** @deprecated Use palette.green */
  forest: '#80C738',
  ink: '#4A4B4D',
  slate: '#8B8D90',
  muted: '#8B8D90',
  shell: '#F5F5F6',
  panel: '#F5F5F6',
  line: '#E8E8E9',
  danger: '#C92A2A',
  cream: '#FFF9E6',
};

export const logo = require('@/assets/images/kcic-logo.png');
export const profileAvatar = require('@/assets/images/image.png');

export function AppScreen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const onScroll = useMinimizeOnScroll();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, padded ? styles.padded : null]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

export function TopBar({
  avatarSource,
  showProfileAvatar,
  hasUnread,
  onPressNotifications,
  onPressAvatar,
}: {
  avatarSource?: ImageSourcePropType;
  showProfileAvatar?: boolean;
  hasUnread?: boolean;
  onPressNotifications?: () => void;
  onPressAvatar?: () => void;
}) {
  const avatar = avatarSource ?? (showProfileAvatar ? profileAvatar : undefined);
  return (
    <View style={styles.topBar}>
      <Image source={logo} style={styles.logo} contentFit="contain" />
      <View style={styles.topActions}>
        <Pressable
          onPress={onPressNotifications}
          hitSlop={8}
          style={styles.notificationWrap}
          accessibilityRole="button"
          accessibilityLabel="Notifications">
          <MaterialIcons name="notifications-none" size={22} color={palette.ink} />
          {hasUnread ? <View style={styles.unreadDot} /> : null}
        </Pressable>
        <Pressable onPress={onPressAvatar} hitSlop={8} accessibilityRole="button" accessibilityLabel="Profile">
          {avatar ? (
            <Image source={avatar} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialIcons name="person" size={18} color={palette.forest} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function Pill({
  label,
  active,
  tone = 'green',
  onPress,
}: {
  label: string;
  active?: boolean;
  tone?: 'green' | 'blue' | 'neutral' | 'cream';
  onPress?: () => void;
}) {
  const content = (
    <View
      style={[
        styles.pill,
        active ? styles.pillActive : null,
        tone === 'blue' ? styles.pillBlue : null,
        tone === 'cream' ? styles.pillCream : null,
      ]}>
      <Text style={[styles.pillText, active ? styles.pillTextActive : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

export function SectionTitle({
  title,
  action,
  icon,
  onPressAction,
}: {
  title: string;
  action?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPressAction?: () => void;
}) {
  const actionContent = (
    <View style={styles.sectionAction}>
      {icon ? <MaterialIcons name={icon} size={18} color={palette.blue} /> : null}
      {action ? <Text style={styles.actionText}>{action}</Text> : null}
    </View>
  );

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onPressAction ? (
        <Pressable onPress={onPressAction} hitSlop={8} accessibilityRole="button">
          {actionContent}
        </Pressable>
      ) : (
        actionContent
      )}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Pressable onPress={onPress} style={[styles.card, style]} accessibilityRole="button">
      {children}
    </Pressable>
  );
}

export function SearchField({
  placeholder,
  onPress,
  value,
  onChangeText,
  editable = false,
}: {
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}) {
  const inner = (
    <>
      <MaterialIcons name="search" size={22} color={palette.slate} />
      {editable ? (
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={palette.slate}
          value={value}
          onChangeText={onChangeText}
          autoFocus
          returnKeyType="search"
        />
      ) : (
        <Text style={styles.searchText}>{value || placeholder}</Text>
      )}
    </>
  );

  if (editable) {
    return <View style={styles.search}>{inner}</View>;
  }

  return (
    <Pressable onPress={onPress} style={styles.search} accessibilityRole="button">
      {inner}
    </Pressable>
  );
}

export function ImageHeader({
  source,
  height = 190,
  children,
}: {
  source: ImageSourcePropType | string;
  height?: number;
  children?: ReactNode;
}) {
  const imageSource = typeof source === 'string' ? { uri: source } : source;
  return (
    <View style={[styles.imageHeader, { height }]}>
      <Image source={imageSource} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.imageShade} />
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  icon,
  variant = 'solid',
  onPress,
}: {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'solid' | 'outline';
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'outline' ? styles.buttonOutline : null]}
      accessibilityRole="button">
      {icon ? (
        <MaterialIcons
          name={icon}
          size={18}
          color={variant === 'outline' ? palette.forest : palette.white}
        />
      ) : null}
      <Text style={[styles.buttonText, variant === 'outline' ? styles.buttonTextOutline : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: TAB_SCREEN_BOTTOM_INSET,
  },
  padded: {
    paddingHorizontal: 18,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  logo: {
    width: 76,
    height: 42,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationWrap: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.danger,
    borderWidth: 1.5,
    borderColor: palette.shell,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: palette.white,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F7DE',
  },
  pill: {
    minHeight: 28,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: palette.lime,
  },
  pillBlue: {
    backgroundColor: '#DDF5FC',
  },
  pillCream: {
    backgroundColor: palette.cream,
  },
  pillText: {
    color: palette.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: palette.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: palette.limeDark,
    fontSize: 13,
    fontWeight: '800',
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 18,
    boxShadow: '0px 8px 20px rgba(29, 61, 42, 0.05)',
    elevation: 2,
  },
  search: {
    minHeight: 48,
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CDD5CD',
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchText: {
    color: palette.slate,
    fontSize: 14,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    color: palette.ink,
    fontSize: 14,
    paddingVertical: 0,
  },
  imageHeader: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 28, 22, 0.28)',
  },
  button: {
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonOutline: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.limeDark,
  },
  buttonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonTextOutline: {
    color: palette.forest,
  },
});
