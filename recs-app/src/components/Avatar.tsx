import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../lib/theme';

type Props = {
  name: string;
  uri?: string | null;
  size?: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase() || '?';
}

/** mvp/Avatar — dark disc with a 2px orange ring; initials fallback when no image. */
export function Avatar({ name, uri, size = 40 }: Props) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.base, dim]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]} numberOfLines={1}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary800,
    borderWidth: 2,
    borderColor: colors.primary400,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  initials: { fontFamily: fonts.bodyBold, color: colors.fontOnPrimary },
});
