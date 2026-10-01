import { Text } from './AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, gradients } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Variant = 'primary' | 'journey' | 'secondary' | 'danger' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
};

export function GradientButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: Props) {
  if (variant === 'secondary' || variant === 'danger' || variant === 'ghost') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.base,
          variant === 'secondary' && styles.secondary,
          variant === 'danger' && styles.danger,
          variant === 'ghost' && styles.ghost,
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'danger' ? colors.red : colors.teal} />
        ) : (
          <Text
            style={[
              styles.label,
              variant === 'secondary' && styles.secondaryLabel,
              variant === 'danger' && styles.dangerLabel,
              variant === 'ghost' && styles.ghostLabel,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  const colorsFor = variant === 'journey' ? gradients.journeyButton : gradients.authButton;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[...colorsFor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.base}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  base: {
    minHeight: 58,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  label: {
    color: colors.white,
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '700',
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  secondaryLabel: {
    color: colors.tealDeep,
  },
  danger: {
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerLabel: {
    color: '#B91C1C',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: colors.blue,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
});
