import { Platform, StyleSheet, Text as NativeText, type TextProps } from 'react-native';
import { colors } from '../theme/colors';

export function Text({ style, ...props }: TextProps) {
  const resolved = StyleSheet.flatten(style) ?? {};
  const size = resolved.fontSize ?? 16;
  return (
    <NativeText
      {...props}
      style={[
        {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          fontSize: 16,
          color: colors.navy,
          lineHeight: Math.round(size * 1.45),
        },
        style,
      ]}
    />
  );
}
