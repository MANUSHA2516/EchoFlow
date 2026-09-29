import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HeartPulse, Stethoscope, UserRound } from 'lucide-react-native';
import { VisitReason, VisitStatus, VISIT_REASON_LABELS } from '@echoflow/types';
import { Card } from '../../components/Card';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { formatVisitDate } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

function visitIcon(type: VisitReason) {
  if (type === VisitReason.FollowUp) return <UserRound size={18} color={colors.blue} />;
  if (type === VisitReason.DoctorReferral) {
    return <Stethoscope size={18} color={colors.amberDeep} />;
  }
  return <HeartPulse size={18} color={colors.teal} />;
}

export function HistoryScreen() {
  const { visits, loadVisits, error, dashboard } = usePatient();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      void loadVisits()
        .catch(() => undefined)
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [loadVisits]),
  );

  const refresh = async () => {
    setLoading(true);
    try {
      await loadVisits();
    } catch {
      // The shared error state is rendered below.
    } finally {
      setLoading(false);
    }
  };

  const completed = visits.filter((v) => v.status === VisitStatus.Completed).length;
  const archived = visits.filter((v) => v.status === VisitStatus.Archived).length;
  const total = dashboard?.patient.totalVisits ?? visits.length;

  return (
    <Screen refreshing={loading} onRefresh={() => void refresh()}>
      <StatusBadge label="ECHO UNIT RECORDS" tone="teal" />
      <ScreenHeader title="Visit history" subtitle="Past appointments at the ECO unit" />

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total visits</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statValue}>{archived}</Text>
          <Text style={styles.statLabel}>Archived</Text>
        </Card>
      </View>

      <ErrorText message={error} />

      {loading && visits.length === 0 ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.stateText}>Loading visit history…</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <GradientButton variant="secondary" label="Try again" onPress={() => void refresh()} />
      ) : null}

      {!loading && !error && visits.length === 0 ? (
        <View style={styles.state}>
          <Text style={styles.emptyTitle}>No visits recorded yet</Text>
          <Text style={styles.stateText}>Your completed ECO visits will appear here.</Text>
        </View>
      ) : null}

      {visits.map((v) => (
        <View key={v.id} style={styles.visit}>
          <View
            style={[
              styles.stripe,
              v.status === VisitStatus.Completed ? styles.stripeDone : styles.stripeArchived,
            ]}
          />
          <View style={styles.icon}>{visitIcon(v.visitType)}</View>
          <View style={styles.body}>
            <Text style={styles.type}>{VISIT_REASON_LABELS[v.visitType]}</Text>
            <Text style={styles.meta}>
              {formatVisitDate(v.serviceDate)} · {v.doctorName}
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              v.status === VisitStatus.Completed ? styles.pillDone : styles.pillArchived,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                v.status === VisitStatus.Completed ? styles.pillTextDone : styles.pillTextArchived,
              ]}
            >
              {v.status === VisitStatus.Completed ? 'Completed' : 'Archived'}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 100,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.navy,
    fontWeight: '800',
    fontSize: 15,
  },
  stateText: {
    color: colors.slate,
    textAlign: 'center',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.slate,
    fontWeight: '600',
    textAlign: 'center',
  },
  visit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  stripe: {
    width: 5,
    alignSelf: 'stretch',
  },
  stripeDone: { backgroundColor: colors.green },
  stripeArchived: { backgroundColor: '#94A3B8' },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  type: {
    fontWeight: '800',
    color: colors.navy,
  },
  meta: {
    marginTop: 2,
    color: colors.slate,
    fontSize: 12,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillDone: { backgroundColor: colors.greenSoft },
  pillArchived: { backgroundColor: '#F1F5F9' },
  pillText: { fontSize: 11, fontWeight: '800' },
  pillTextDone: { color: '#047857' },
  pillTextArchived: { color: colors.slate },
});
