import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Check, QrCode, UserRound } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/Card';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'LiveQueue'>;

export function LiveQueueScreen({ navigation }: Props) {
  const { dashboard, refreshDashboard, busy } = usePatient();
  const queue = dashboard?.queue;

  return (
    <Screen
      refreshing={busy}
      onRefresh={() => {
        void refreshDashboard();
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Live queue tracking</Text>
        <StatusBadge label="• AI PREDICTING" tone="green" />
      </View>

      {!queue?.ticketNumber ? (
        <>
          <Text style={styles.empty}>Join the queue to see live tracking.</Text>
          <GradientButton
            variant="journey"
            label="Join today’s queue"
            onPress={() => navigation.replace('JoinQueue')}
          />
        </>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.caps}>QUEUE NUMBER</Text>
                <Text style={styles.ticket}>{queue.ticketNumber}</Text>
              </View>
              <View style={styles.circle}>
                <Text style={styles.circleValue}>{queue.patientsAhead}</Text>
                <Text style={styles.circleLabel}>People ahead</Text>
              </View>
              <View style={[styles.summaryCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.caps}>YOUR STATUS</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>In Queue</Text>
                </View>
              </View>
            </View>
          </Card>

          {queue.positionMovedAlert ? (
            <View style={styles.moved}>
              <AlertTriangle size={18} color={colors.amberDeep} />
              <Text style={styles.movedBody}>
                Your position moved back. A patient checked in on-site (QR verified) and was
                given priority.
              </Text>
            </View>
          ) : null}

          <Pressable
            style={styles.qrBar}
            onPress={() => navigation.navigate('CheckInQr')}
          >
            <Text style={styles.qrBarText}>Checked in on-site? Show your QR</Text>
            <LinearGradient colors={[...gradients.journeyButton]} style={styles.qrChip}>
              <QrCode size={14} color={colors.white} />
              <Text style={styles.qrChipText}>QR</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.timeline}>
            {queue.timeline.map((item, index) => (
              <View key={`${item.ticketNumber}-${item.stage}`} style={styles.item}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.dot,
                      item.stage === 'completed' && styles.dotDone,
                      item.stage === 'in_progress' && styles.dotLive,
                      item.stage === 'next_up' && styles.dotNext,
                      item.stage === 'you' && styles.dotYou,
                    ]}
                  >
                    {item.stage === 'completed' ? (
                      <Check size={12} color={colors.white} strokeWidth={3} />
                    ) : item.stage === 'next_up' || item.stage === 'you' ? (
                      <UserRound size={12} color={colors.white} />
                    ) : (
                      <View style={styles.innerDot} />
                    )}
                  </View>
                  {index < queue.timeline.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={[styles.itemCard, item.isYou && styles.itemYou]}>
                  <Text style={[styles.itemTicket, item.isYou && styles.itemTicketYou]}>
                    {item.ticketNumber}
                  </Text>
                  <Text
                    style={[
                      styles.itemLabel,
                      item.stage === 'completed' && { color: colors.green },
                      item.stage === 'next_up' && { color: colors.blue },
                      item.isYou && { color: colors.tealDeep, fontWeight: '800' },
                    ]}
                  >
                    {item.label}
                    {item.etaMinutes != null && item.stage !== 'completed'
                      ? ` ~${item.etaMinutes} min`
                      : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
  },
  empty: { color: colors.slate, textAlign: 'center' },
  summaryCard: {
    paddingVertical: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
    gap: 6,
  },
  caps: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: colors.slateSoft,
  },
  ticket: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.blue,
    fontVariant: ['tabular-nums'],
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
  },
  circleValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
  },
  circleLabel: {
    fontSize: 10,
    color: colors.slate,
    fontWeight: '600',
  },
  statusPill: {
    backgroundColor: colors.blueSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: colors.blue,
    fontWeight: '800',
    fontSize: 12,
  },
  moved: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.amberSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  movedBody: {
    flex: 1,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '600',
  },
  qrBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#B9DFE8',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  qrBarText: {
    flex: 1,
    color: colors.tealDeep,
    fontWeight: '700',
  },
  qrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qrChipText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  timeline: {
    gap: 0,
    marginTop: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 64,
  },
  rail: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  dotLive: {
    backgroundColor: colors.white,
    borderColor: colors.blue,
  },
  dotNext: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  dotYou: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  itemCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
  },
  itemYou: {
    backgroundColor: colors.blueSoft,
    borderWidth: 1.5,
    borderColor: colors.teal,
  },
  itemTicket: {
    fontWeight: '800',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  itemTicketYou: {
    color: colors.tealDeep,
  },
  itemLabel: {
    color: colors.slate,
    fontWeight: '700',
    fontSize: 12,
  },
});
