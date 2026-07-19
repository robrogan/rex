import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radii, spacing } from '../lib/theme';

type Props = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/** mvp/Pill — active = orange fill + dark label; inactive = violet outline; disabled dims + "soon". */
export function TabPill({ label, active = false, disabled = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        active ? styles.active : styles.inactive,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      {disabled ? <Text style={styles.soon}>soon</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.xl,
  },
  active: { backgroundColor: colors.primary400 },
  inactive: { borderWidth: 1, borderColor: colors.font },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
  labelActive: { color: colors.primary800 },
  soon: { fontFamily: fonts.action, fontSize: 11, color: colors.font },
});
