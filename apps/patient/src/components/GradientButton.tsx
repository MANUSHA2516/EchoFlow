import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
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

  const colorsFor =
    variant === 'journey' ? gradients.journeyButton : gradients.authButton;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.pressable, (disabled || loading) && styles.disabled, style]}
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
    minHeight: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    color: colors.white,
    fontSize: 16,
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
