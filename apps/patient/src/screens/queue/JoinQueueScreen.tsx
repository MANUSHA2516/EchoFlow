import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TIME_SLOT_LABELS, TimeSlot, VisitReason, VISIT_REASON_LABELS } from '@echoflow/types';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TextField } from '../../components/TextField';
import { QueueWaitForecast } from '../../components/QueueWaitForecast';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'JoinQueue'>;

const REASONS = Object.values(VisitReason);
const SLOTS = Object.keys(TIME_SLOT_LABELS) as TimeSlot[];

export function JoinQueueScreen({ navigation }: Props) {
  const { dashboard, joinQueue, busy, error } = usePatient();
  const [reason, setReason] = useState<VisitReason>(VisitReason.RoutineEcho);
  const [slot, setSlot] = useState<TimeSlot>('09-11');
  const [notes, setNotes] = useState('');
  const [reasonOpen, setReasonOpen] = useState(false);

  return (
    <Screen>
      <ScreenHeader
        title="Join today’s queue"
        onBack={() => navigation.goBack()}
      />

      <View>
        <Text style={styles.label}>Reason for visit</Text>
        <Pressable style={styles.select} onPress={() => setReasonOpen((v) => !v)}>
          <Text style={styles.selectText}>{VISIT_REASON_LABELS[reason]}</Text>
          <Text style={styles.chevron}>{reasonOpen ? '▴' : '▾'}</Text>
        </Pressable>
        {reasonOpen
          ? REASONS.map((r) => (
              <Pressable
                key={r}
                style={styles.option}
                onPress={() => {
                  setReason(r);
                  setReasonOpen(false);
                }}
              >
                <Text style={styles.optionText}>{VISIT_REASON_LABELS[r]}</Text>
              </Pressable>
            ))
          : null}
      </View>

      <View>
        <Text style={styles.label}>Preferred time slot</Text>
        <View style={styles.chips}>
          {SLOTS.map((s) => {
            const active = s === slot;
            return (
              <Pressable
                key={s}
                onPress={() => setSlot(s)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {TIME_SLOT_LABELS[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Notes for staff (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any symptoms or referral details"
        multiline
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <QueueWaitForecast slot={slot} queueLength={dashboard?.queue.totalInQueue ?? 0} />

      <ErrorText message={error} />

      <GradientButton
        variant="journey"
        label="Confirm and join queue"
        loading={busy}
        onPress={async () => {
          try {
            await joinQueue({ reason, slot, notes: notes.trim() || undefined });
            navigation.replace('LiveTicket');
          } catch {
            /* context */
          }
        }}
      />

      <Text style={styles.note}>
        You can leave the waiting room — we’ll track your place automatically.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.slate,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  select: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: colors.navy,
    fontWeight: '600',
  },
  chevron: {
    color: colors.slate,
    fontSize: 16,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    color: colors.navy,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  chipText: {
    fontWeight: '700',
    color: colors.slate,
  },
  chipTextActive: {
    color: colors.white,
  },
  note: {
    textAlign: 'center',
    color: colors.slate,
    fontSize: 13,
    lineHeight: 20,
  },
});
