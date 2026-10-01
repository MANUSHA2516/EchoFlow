import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { colors } from '../theme/colors';
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ScrollView
      style={{ flexGrow: 0, flexShrink: 0 }}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option }}
          onPress={() => onChange(option)}
          style={[styles.chip, value === option && styles.active]}
        >
          <Text style={[styles.label, value === option && styles.selected]}>{option}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2, alignItems: 'center' },
  chip: {
    minHeight: 46,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  active: { backgroundColor: colors.tealDeep, borderColor: colors.tealDeep },
  label: { fontSize: 14, fontWeight: '700', color: colors.slate },
  selected: { color: colors.white },
});
