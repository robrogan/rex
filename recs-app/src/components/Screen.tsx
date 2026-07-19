import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, type } from '../lib/theme';

type Props = PropsWithChildren<{ title: string; spec?: string }>;

/** Placeholder scaffold used by all unbuilt screens (A1). Replace per-screen in A4–A7. */
export function Screen({ title, spec, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {spec ? <Text style={styles.spec}>{spec}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...type.heading },
  spec: { ...type.action, opacity: 0.8 },
});
