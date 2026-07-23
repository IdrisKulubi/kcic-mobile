import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/kcic/ui';
import { subscribeToToasts, type ToastMessage, type ToastTone } from '@/lib/toast';

const toneStyles: Record<
  ToastTone,
  { icon: keyof typeof MaterialIcons.glyphMap; color: string; tint: string; border: string }
> = {
  success: { icon: 'check-circle', color: palette.forest, tint: '#EAF7F0', border: '#B9DFC9' },
  error: { icon: 'error-outline', color: palette.danger, tint: '#FFF0F0', border: '#F0C2C2' },
  warning: { icon: 'warning-amber', color: '#9A6200', tint: '#FFF7E2', border: '#EDD394' },
  info: { icon: 'info-outline', color: '#08769A', tint: '#EAF7FC', border: '#B9DDEA' },
};

function ToastItem({ item, onDismiss }: { item: ToastMessage; onDismiss: (id: number) => void }) {
  const animation = useRef(new Animated.Value(0)).current;
  const tone = toneStyles[item.tone];

  useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(animation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => onDismiss(item.id));
    }, item.duration ?? 4200);

    return () => clearTimeout(timer);
  }, [animation, item.duration, item.id, onDismiss]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.toast,
        {
          backgroundColor: tone.tint,
          borderColor: tone.border,
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-18, 0],
              }),
            },
          ],
        },
      ]}>
      <MaterialIcons name={tone.icon} size={23} color={tone.color} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: tone.color }]}>{item.title}</Text>
        {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
      </View>
      <Pressable
        accessibilityLabel="Dismiss notification"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => onDismiss(item.id)}
        style={({ pressed }) => [styles.close, pressed ? styles.closePressed : null]}>
        <MaterialIcons name="close" size={18} color={palette.slate} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(
    () =>
      subscribeToToasts((message) => {
        setMessages((current) => [...current.slice(-1), message]);
      }),
    []
  );

  const dismiss = useCallback((id: number) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  return (
    <View style={styles.root}>
      {children}
      <View pointerEvents="box-none" style={[styles.viewport, { paddingTop: insets.top + 10 }]}>
        {messages.map((message) => (
          <ToastItem key={message.id} item={message} onDismiss={dismiss} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  viewport: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 999,
    elevation: 999,
  },
  toast: {
    width: '100%',
    maxWidth: 520,
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    shadowColor: '#102018',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.16,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 8,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  message: {
    color: palette.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  close: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginRight: -5,
  },
  closePressed: {
    backgroundColor: 'rgba(17, 24, 39, 0.08)',
  },
});
