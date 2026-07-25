import { StyleSheet, View } from 'react-native';

type SavedListSkeletonProps = {
  colors: {
    surface: string;
    border: string;
    surfaceAlt: string;
  };
  rows?: number;
};

export function SavedListSkeleton({ colors, rows = 4 }: SavedListSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.row,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={[styles.thumbnail, { backgroundColor: colors.surfaceAlt }]} />
          <View style={styles.copy}>
            <View style={[styles.lineShort, { backgroundColor: colors.surfaceAlt }]} />
            <View style={[styles.lineLong, { backgroundColor: colors.surfaceAlt }]} />
            <View style={[styles.lineMedium, { backgroundColor: colors.surfaceAlt }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  copy: {
    flex: 1,
    gap: 10,
  },
  lineShort: {
    width: '28%',
    height: 10,
    borderRadius: 5,
  },
  lineLong: {
    width: '88%',
    height: 16,
    borderRadius: 6,
  },
  lineMedium: {
    width: '52%',
    height: 11,
    borderRadius: 5,
  },
});
