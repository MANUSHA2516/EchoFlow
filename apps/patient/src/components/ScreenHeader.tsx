import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.back} hitSlop={12}>
            <ChevronLeft color={colors.navy} size={22} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  backSpacer: { width: 40 },
  center: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.slate,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
