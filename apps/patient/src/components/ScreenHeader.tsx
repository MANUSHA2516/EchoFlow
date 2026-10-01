import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from './AppText';
import { colors } from '../theme/colors';
type Props = { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode };
export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack || right ? (
        <View style={styles.toolbar}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.back}
              hitSlop={8}
            >
              <ChevronLeft color={colors.navy} size={22} />
            </Pressable>
          ) : (
            <View />
          )}
          {right}
        </View>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { marginTop: 4, gap: 6 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  back: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, color: colors.navy },
  subtitle: { fontSize: 15, color: colors.slate },
});
