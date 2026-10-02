import { AnimatedProgress } from '../../components/AnimatedProgress';
import { HeroDecoration, PulseDot } from '../../components/Motion';
import { Text } from '../../components/AppText';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ConfirmSheet } from '../../components/ConfirmSheet';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { QueueWaitForecast } from '../../components/QueueWaitForecast';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'LiveTicket'>;

export function LiveTicketScreen({ navigation }: Props) {
  const { dashboard, leaveQueue, busy, error, refreshDashboard } = usePatient();
  const queue = dashboard?.queue;
  const [confirmLeave, setConfirmLeave] = useState(false);
  const refreshInFlight = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        if (refreshInFlight.current) return;
        refreshInFlight.current = true;
        try {
          await refreshDashboard();
        } catch {
          /* shared error state */
        } finally {
          refreshInFlight.current = false;
        }
      };
      void refresh();
      const timer = setInterval(() => void refresh(), 15000);
      return () => clearInterval(timer);
    }, [refreshDashboard]),
  );

  if (!queue?.ticketNumber) {
    return (
      <Screen>
        <ScreenHeader title="Your number" onBack={() => navigation.goBack()} />
        <Text style={styles.empty}>No active ticket. Join today’s queue to get a number.</Text>
        <GradientButton
          variant="journey"
          label="Join today’s queue"
          onPress={() => navigation.replace('JoinQueue')}
        />
      </Screen>
    );
  }

  const progress = Math.max(
    0.08,
    Math.min(0.95, 1 - queue.patientsAhead / Math.max(queue.totalInQueue, 1)),
  );

  return (
    <Screen refreshing={busy} onRefresh={() => void refreshDashboard().catch(() => undefined)}>
      <ScreenHeader title="Your number" onBack={() => navigation.navigate('QueueHome')} />

      <LinearGradient colors={[...gradients.ticket]} style={styles.ticketCard}>
        <HeroDecoration />
        <View style={styles.ticketTop}>
          <Text style={styles.yourNumber}>Your number</Text>
          <View style={styles.livePill}>
            <PulseDot color={colors.cyan} />
            <Text style={styles.liveText}>LIVE UPDATES</Text>
          </View>
        </View>
        <Text style={styles.ticketNo}>{queue.ticketNumber}</Text>
        <View style={styles.predPill}>
          <Text style={styles.predText}>Predicted: {queue.predictedWaitMinutes ?? '—'} min</Text>
        </View>
      </LinearGradient>

      {queue.slot ? (
        <QueueWaitForecast slot={queue.slot} queueLength={queue.patientsAhead} />
      ) : null}

      <Card>
        <View style={styles.servingRow}>
          <View style={styles.servingLeft}>
            <View style={styles.amberDot} />
            <Text style={styles.nowServing}>NOW SERVING</Text>
          </View>
          <Text style={styles.servingNo}>{queue.currentlyServing ?? '—'}</Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <AnimatedProgress value={progress} label="Queue progress" />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{queue.patientsAhead} ahead of you</Text>
          <Text style={styles.stat}>{queue.totalInQueue} in queue total</Text>
        </View>
      </Card>

      <View style={styles.alert}>
        <View style={styles.alertIcon}>
          <Bell size={16} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>We’ll notify you</Text>
          <Text style={styles.alertBody}>3 patients before your turn</Text>
        </View>
      </View>

      <ErrorText message={error} />

      <View style={styles.actions}>
        <GradientButton
          variant="secondary"
          label="Leave queue"
          style={{ flex: 1 }}
          loading={busy}
          onPress={() => setConfirmLeave(true)}
        />
        <GradientButton
          variant="journey"
          label="Live Queue"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('LiveQueue')}
        />
      </View>
      <ConfirmSheet
        visible={confirmLeave}
        title="Leave the queue?"
        message="Your ticket will be cancelled and your current place will be lost."
        confirmLabel="Yes, leave queue"
        busy={busy}
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          void leaveQueue()
            .then(() => {
              setConfirmLeave(false);
              navigation.replace('JoinQueue');
            })
            .catch(() => setConfirmLeave(false));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.slate,
    lineHeight: 24,
  },
  ticketCard: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yourNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6EE7B7',
  },
  liveText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketNo: {
    color: colors.white,
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  predPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  predText: {
    color: colors.white,
    fontWeight: '700',
  },
  servingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amber,
  },
  nowServing: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.slate,
  },
  servingNo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    marginTop: spacing.md,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  statsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    color: colors.slate,
    fontWeight: '600',
    fontSize: 15,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.peach,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.amberDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontWeight: '800',
    color: colors.navy,
  },
  alertBody: {
    color: colors.slate,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
