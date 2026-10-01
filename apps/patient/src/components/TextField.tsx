import { Text } from './AppText';
import { ReactNode, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Props = TextInputProps & {
  label: string;
  icon?: ReactNode;
  right?: ReactNode;
  prefix?: string;
  locked?: boolean;
};

export function TextField({
  label,
  icon,
  right,
  prefix,
  locked,
  onFocus,
  onBlur,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, locked && styles.locked, focused && styles.focused]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.slateSoft}
          editable={!locked && rest.editable !== false}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: colors.slate,
  },
  field: {
    minHeight: 60,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locked: {
    backgroundColor: '#F1F5F9',
  },
  focused: {
    borderColor: colors.blue,
    backgroundColor: colors.white,
  },
  icon: {
    opacity: 0.85,
  },
  prefix: {
    color: colors.navy,
    fontWeight: '700',
    fontSize: 17,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.navy,
    fontSize: 17,
    paddingVertical: spacing.md,
  },
  right: {
    marginLeft: spacing.xs,
  },
});
