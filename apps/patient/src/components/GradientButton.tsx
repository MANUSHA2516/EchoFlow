import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './AppText';
import { useMotion } from '../lib/MotionContext';
import { colors, gradients } from '../theme/colors';
import { radii } from '../theme/spacing';
type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'journey' | 'secondary' | 'danger' | 'ghost';
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
  const { enabled } = useMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const inactive = !!disabled || !!loading;
  useEffect(() => {
    if (inactive || !enabled) {
      scale.stopAnimation();
      scale.setValue(1);
    }
    return () => scale.stopAnimation();
  }, [enabled, inactive, scale]);
  const press = (down: boolean) => {
    if (!enabled || inactive) return;
    Animated.spring(scale, {
      toValue: down ? 0.975 : 1,
      damping: 16,
      stiffness: 280,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };
  const primary = variant === 'primary' || variant === 'journey';
  const foreground = primary ? colors.white : variant === 'danger' ? '#B91C1C' : colors.tealDeep;
  const content = loading ? (
    <ActivityIndicator color={foreground} />
  ) : (
    <Text style={[styles.label, { color: foreground }]}>{label}</Text>
  );
  return (
    <Animated.View
      style={[
        primary && styles.elevated,
        style,
        inactive && styles.disabled,
        { transform: [{ scale }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: !!loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={() => press(true)}
        onPressOut={() => press(false)}
        style={({ pressed }) => [
          styles.pressable,
          !primary && styles.base,
          variant === 'secondary' && styles.secondary,
          variant === 'danger' && styles.danger,
          pressed && { opacity: 0.88 },
        ]}
      >
        {primary ? (
          <LinearGradient
            colors={[...(variant === 'journey' ? gradients.journeyButton : gradients.authButton)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.base}
          >
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </Pressable>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  elevated: {
    shadowColor: colors.tealDeep,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderRadius: radii.lg,
  },
  pressable: { borderRadius: radii.lg, overflow: 'hidden' },
  base: {
    minHeight: 58,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 17, textAlign: 'center', fontWeight: '700' },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#BDDCE8' },
  danger: { backgroundColor: colors.redSoft, borderWidth: 1, borderColor: '#FECACA' },
  disabled: { opacity: 0.55 },
});
