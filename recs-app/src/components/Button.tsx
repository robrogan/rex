import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, fonts, radii } from '../lib/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** mvp/Button — pixel label, orange fill, dark text. */
export function PrimaryButton({ label, onPress, disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.primary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, styles.labelPrimary]}>{label}</Text>
    </Pressable>
  );
}

/** Outlined violet variant of PrimaryButton. */
export function SecondaryButton({ label, onPress, disabled = false, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: radii.lg,
  },
  primary: { backgroundColor: colors.primary400 },
  secondary: { borderWidth: 1, borderColor: colors.font, backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontFamily: fonts.action, fontSize: 18 },
  labelPrimary: { color: colors.primary800 },
  labelSecondary: { color: colors.font },
});
