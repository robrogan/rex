import { Link } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Screen } from '../../components/Screen';
import { colors, radii, spacing, type } from '../../lib/theme';

const TABS = ['Books', 'Shows', 'Movies', 'Sites'] as const;

/** S3 — Home / TBR list (designed in Figma "Initial"). Real data + BookCard in A6. */
export default function Home() {
  return (
    <Screen title="What’s next on your TBR?" spec="S3 · category pills; only Books active in MVP">
      <View style={styles.row}>
        {TABS.map((t, i) => (
          <View key={t} style={[styles.pill, i === 0 && styles.pillActive]}>
            <Text style={[type.action, i === 0 && { color: colors.primary800 }]}>{t}</Text>
          </View>
        ))}
      </View>
      <Link href="/search" style={type.action}>🔍 Something specific? (S4)</Link>
      <Link href="/item/oathbringer-demo" style={type.action}>→ Demo book detail (S5)</Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: colors.description,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillActive: { backgroundColor: colors.primary400, borderColor: colors.primary400 },
});
