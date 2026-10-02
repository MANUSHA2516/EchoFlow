import { AnimatedProgress } from './AnimatedProgress';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, ClipboardCheck } from 'lucide-react-native';
import { Text } from './AppText';
import { Card } from './Card';
import { colors } from '../theme/colors';
const items = [
  'Bring your NIC or patient identification',
  'Keep referral letters and previous reports ready',
  'Have your queue QR ready at reception',
];
export function VisitChecklist() {
  const [checked, setChecked] = useState<number[]>([]);
  return (
    <Card>
      <View style={styles.heading}>
        <View style={styles.icon}>
          <ClipboardCheck size={22} color={colors.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Ready for your visit?</Text>
          <Text style={styles.subtitle}>
            {checked.length} of {items.length} ready
          </Text>
        </View>
      </View>
      <View style={{ marginVertical: 18 }}>
        <AnimatedProgress value={checked.length / items.length} label="Visit preparation" />
      </View>
      {checked.length === items.length && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: colors.tealDeep, fontWeight: '700', marginBottom: 8 }}
        >
          All set. Your visit essentials are ready.
        </Text>
      )}
      {items.map((item, i) => (
        <Pressable
          key={item}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: checked.includes(i) }}
          onPress={() =>
            setChecked((current) =>
              current.includes(i) ? current.filter((n) => n !== i) : [...current, i],
            )
          }
          style={styles.item}
        >
          <View style={[styles.box, checked.includes(i) && styles.checked]}>
            {checked.includes(i) && <Check size={16} color={colors.white} />}
          </View>
          <Text style={styles.label}>{item}</Text>
        </Pressable>
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 19, fontWeight: '800' },
  subtitle: { fontSize: 13, color: colors.slate },
  track: {
    height: 5,
    backgroundColor: colors.blueSoft,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 18,
  },
  fill: { height: '100%', backgroundColor: colors.teal, borderRadius: 5 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: colors.teal, borderColor: colors.teal },
  label: { flex: 1, fontSize: 15 },
});
