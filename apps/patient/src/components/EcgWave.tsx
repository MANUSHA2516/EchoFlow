import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

export function EcgWave({ width = 280, height = 36 }: { width?: number; height?: number }) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(offset, {
        toValue: -width,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [offset, width]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Animated.View style={[styles.track, { width: width * 2, transform: [{ translateX: offset }] }]}>
        {[0, 1].map((tile) => (
          <Svg key={tile} width={width} height={height} viewBox="0 0 280 36">
            <Path
              d="M0 22 H40 L48 22 L56 6 L64 30 L72 22 H120 L128 22 L136 10 L144 28 L152 22 H200 L208 22 L216 8 L224 30 L232 22 H280"
              stroke={colors.cyan}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M0 22 H40 L48 22 L56 6 L64 30 L72 22 H120 L128 22 L136 10 L144 28 L152 22 H200 L208 22 L216 8 L224 30 L232 22 H280"
              stroke={colors.teal}
              strokeWidth={1.2}
              fill="none"
              opacity={0.55}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  track: {
    height: '100%',
    flexDirection: 'row',
  },
});
