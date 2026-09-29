import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

export function EcgWave({ width = 280, height = 36 }: { width?: number; height?: number }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const x = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, width - 12] });
  const opacity = pulse.interpolate({
    inputRange: [0, 0.12, 0.88, 1],
    outputRange: [0, 0.8, 0.8, 0],
  });

  return (
    <View style={[styles.wrap, { width, height }]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height} viewBox="0 0 280 36" preserveAspectRatio="none">
          <Path
            d="M0 20 H36 C45 20 47 14 53 14 H80 C93 14 100 27 115 27 H137 L146 20 L154 20 L162 5 L170 31 L178 19 H205 C219 19 227 25 241 25 H280"
            stroke={colors.teal}
            strokeWidth={1.7}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M0 20 H36 C45 20 47 14 53 14 H80 C93 14 100 27 115 27 H137 L146 20 L154 20 L162 5 L170 31 L178 19 H205 C219 19 227 25 241 25 H280"
            stroke={colors.cyan}
            strokeWidth={0.8}
            fill="none"
            opacity={0.65}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <Animated.View style={[styles.scan, { opacity, transform: [{ translateX: x }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  scan: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(25,164,179,0.13)',
  },
});
