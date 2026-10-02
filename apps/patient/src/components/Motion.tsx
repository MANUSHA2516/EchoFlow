import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { LucideIcon } from 'lucide-react-native';
import { useMotion } from '../lib/MotionContext';
import { colors } from '../theme/colors';

export function Entrance({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { enabled } = useMotion();
  const focused = useIsFocused();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (!enabled || !focused) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, focused, progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function PulseDot({ color = colors.teal }: { color?: string }) {
  const { enabled } = useMotion();
  const focused = useIsFocused();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled || !focused) {
      pulse.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
      pulse.setValue(0);
    };
  }, [enabled, focused, pulse]);
  return (
    <View accessible={false} style={styles.dotWrap}>
      <Animated.View
        testID="motion-pulse"
        style={[
          styles.halo,
          {
            backgroundColor: color,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] }),
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) },
            ],
          },
        ]}
      />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

export function TabGlyph({
  icon: Icon,
  color,
  size,
  focused,
}: {
  icon: LucideIcon;
  color: string;
  size: number;
  focused: boolean;
}) {
  const { enabled } = useMotion();
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    if (!enabled) {
      progress.setValue(focused ? 1 : 0);
      return;
    }
    const animation = Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 16,
      stiffness: 180,
      mass: 0.7,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, focused, progress]);
  return (
    <Animated.View
      style={[
        styles.tab,
        {
          backgroundColor: focused ? colors.blueSoft : 'transparent',
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
          ],
        },
      ]}
    >
      <Icon color={color} size={size} strokeWidth={focused ? 2.3 : 1.8} />
    </Animated.View>
  );
}

export function HeroDecoration() {
  return (
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      <View style={styles.ringOne} />
      <View style={styles.ringTwo} />
      <View style={styles.glow} />
    </View>
  );
}
const styles = StyleSheet.create({
  dotWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tab: { paddingHorizontal: 17, paddingVertical: 6, borderRadius: 16 },
  ringOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    right: -105,
    top: -85,
  },
  ringTwo: {
    position: 'absolute',
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: '#FFFFFF14',
    right: -140,
    top: -120,
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF08',
    right: -30,
    bottom: -100,
  },
});
