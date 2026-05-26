import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from '@/components/kcic/ui';

export function HeaderBackButton({ label = 'Back' }: { label?: string }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.wrap}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <MaterialIcons name="arrow-back" size={24} color={palette.forest} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: -4,
  },
  label: {
    color: palette.forest,
    fontSize: 17,
    fontWeight: '600',
  },
});
