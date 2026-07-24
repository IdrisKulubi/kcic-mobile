import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, palette } from '@/components/kcic/ui';

export function ContentSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Loading content" style={styles.skeletonGroup}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonCopy}>
            <View style={styles.skeletonShort} />
            <View style={styles.skeletonLong} />
            <View style={styles.skeletonMedium} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ContentMessage({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.message}>
      <View style={styles.icon}>
        <MaterialIcons name={onRetry ? 'cloud-off' : 'article'} size={24} color={palette.blue} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {onRetry ? <PrimaryButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonGroup: { gap: 14, marginBottom: 22 },
  skeletonRow: {
    minHeight: 96,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
  },
  skeletonImage: { width: 86, borderRadius: 8, backgroundColor: '#E8E8E9' },
  skeletonCopy: { flex: 1, justifyContent: 'center', gap: 9 },
  skeletonShort: { width: '34%', height: 9, borderRadius: 5, backgroundColor: '#E8E8E9' },
  skeletonLong: { width: '96%', height: 13, borderRadius: 6, backgroundColor: '#DDDEDF' },
  skeletonMedium: { width: '68%', height: 11, borderRadius: 6, backgroundColor: '#E8E8E9' },
  message: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDF5FC',
  },
  title: { color: palette.ink, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  body: { color: palette.slate, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
