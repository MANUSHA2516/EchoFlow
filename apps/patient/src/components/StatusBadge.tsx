import { Text } from './AppText';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Props = {
  label: string;
  tone?: 'mint' | 'teal' | 'amber' | 'green' | 'blue';
  icon?: ReactNode;
  style?: ViewStyle;
};

const tones = {
  mint: { bg: colors.mint, fg: colors.tealDeep },
  teal: { bg: colors.blueSoft, fg: colors.tealDeep },
  amber: { bg: colors.amberSoft, fg: colors.amberDeep },
  green: { bg: colors.greenSoft, fg: '#047857' },
  blue: { bg: colors.blueSoft, fg: colors.blue },
};

export function StatusBadge({ label, tone = 'mint', icon, style }: Props) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {icon}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
