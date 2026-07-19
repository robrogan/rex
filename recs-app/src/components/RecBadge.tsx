import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../lib/theme';
import { Avatar } from './Avatar';

export type Recommender = { name: string; uri?: string | null };

type Props = {
  recommenders: Recommender[];
  /** Override the auto label ("Name" / "Name +N" / "3+ Friendos"). */
  label?: string;
  avatarSize?: number;
};

function defaultLabel(recommenders: Recommender[]): string {
  const n = recommenders.length;
  if (n === 0) return '';
  const first = recommenders[0]?.name ?? '';
  if (n === 1) return first;
  if (n >= 3) return '3+ Friendos';
  return `${first} +${n - 1}`;
}

/** Stacked recommender avatars (heavy overlap, 3px reveal) + a pixel "+N" label. */
export function RecBadge({ recommenders, label, avatarSize = 24 }: Props) {
  const shown = recommenders.slice(0, 4);
  const reveal = 3;
  return (
    <View style={styles.row}>
      {shown.length > 0 ? (
        <View style={styles.stack}>
          {shown.map((r, i) => (
            <View key={`${r.name}-${i}`} style={i > 0 ? { marginLeft: -(avatarSize - reveal) } : undefined}>
              <Avatar name={r.name} uri={r.uri} size={avatarSize} />
            </View>
          ))}
        </View>
      ) : null}
      <Text style={styles.label}>{label ?? defaultLabel(recommenders)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stack: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
});
