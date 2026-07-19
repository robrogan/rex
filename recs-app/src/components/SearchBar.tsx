import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts, radii, spacing } from '../lib/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** mvp/Input styled as search — dark fill, violet outline, leading magnifier glyph. */
export function SearchBar({ value, onChangeText, placeholder = 'Something specific?' }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.font}
        selectionColor={colors.primary400}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary800,
    borderWidth: 1,
    borderColor: colors.font,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  icon: { fontSize: 18 },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 18, color: colors.font, padding: 0 },
});
