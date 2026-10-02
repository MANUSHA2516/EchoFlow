import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMotion } from '../lib/MotionContext';
import { colors } from '../theme/colors';
export function AnimatedProgress({ value, label }: { value: number; label: string }) {
  const { enabled } = useMotion();
  const target = Math.max(0, Math.min(1, value));
  const progress = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    if (!enabled) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, target, progress]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={{ height: 7, borderRadius: 7, overflow: 'hidden', backgroundColor: colors.blueSoft }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      >
        <LinearGradient
          colors={[colors.teal, colors.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', borderRadius: 7 }}
        />
      </Animated.View>
    </View>
  );
}
