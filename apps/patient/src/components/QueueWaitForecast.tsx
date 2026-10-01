import { Text } from './AppText';
import { useEffect, useState } from 'react';
import { BrainCircuit, Clock3 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import type { TimeSlot } from '@echoflow/types';
import { usePatient } from '../lib/PatientContext';
import type { QueueWaitEstimate } from '../types/patient';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Props = { slot: TimeSlot; queueLength: number };

export function QueueWaitForecast({ slot, queueLength }: Props) {
  const { estimateQueueWait } = usePatient();
  const [estimate, setEstimate] = useState<QueueWaitEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void estimateQueueWait({ slot, queueLength })
      .then((result) => {
        if (active) setEstimate(result);
      })
      .catch(() => {
        if (active) setEstimate(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [estimateQueueWait, queueLength, slot]);

  const synthetic = estimate?.dataProvenance === 'synthetic';

  return (
    <View style={styles.wrap}>
      {synthetic ? (
        <BrainCircuit size={18} color={colors.blue} />
      ) : (
        <Clock3 size={18} color={colors.teal} />
      )}
      <View style={styles.copy}>
        <Text style={styles.title}>
          {loading
            ? 'Updating wait estimate…'
            : estimate
              ? `Estimated wait: ${Math.round(estimate.minutes)} minutes`
              : 'Wait estimate unavailable'}
        </Text>
        <Text style={styles.note}>
          {synthetic
            ? 'Demo forecast from synthetic data; this is not a trained ML estimate.'
            : estimate
              ? 'Operational estimate from queue conditions. Actual wait may differ.'
              : 'You can still use the queue without an estimate.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.blueSoft,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  copy: { flex: 1, gap: 3 },
  title: { color: colors.navy, fontWeight: '700' },
  note: { color: colors.slate, fontSize: 14, lineHeight: 20 },
});
