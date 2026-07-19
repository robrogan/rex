import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../lib/theme';

type Props = { label: string };

/** Genre tag — plain Pixelify word in violet (the drafts render tags without chrome). */
export function TagChip({ label }: Props) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
});
