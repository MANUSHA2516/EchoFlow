import { HeroDecoration, PulseDot } from '../../components/Motion';
import { Text } from '../../components/AppText';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, Check, QrCode, UserRound } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { QueueWaitForecast } from '../../components/QueueWaitForecast';
import { StatusBadge } from '../../components/StatusBadge';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'LiveQueue'>;

export function LiveQueueScreen({ navigation }: Props) {
  const { dashboard, refreshDashboard, error } = usePatient();
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 370 || fontScale > 1.2;
  const queue = dashboard?.queue;
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(
    async (showSpinner = true) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (showSpinner) setRefreshing(true);
      try {
        await refreshDashboard();
        setUpdatedAt(new Date());
      } catch {
        // Keep the last known queue visible and show the request error below.
      } finally {
        inFlight.current = false;
        if (showSpinner) setRefreshing(false);
      }
    },
    [refreshDashboard],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh(false);
      const timer = setInterval(() => void refresh(false), 15000);
      return () => clearInterval(timer);
    }, [refresh]),
  );

  return (
    <Screen refreshing={refreshing} onRefresh={() => void refresh()}>
      <ScreenHeader
        title="Live queue tracking"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        right={
          <StatusBadge
            icon={<PulseDot color={error ? colors.amber : colors.green} />}
            label={error ? 'RETRY' : 'LIVE'}
            tone={error ? 'amber' : 'green'}
          />
        }
      />

      <Text style={{ color: colors.slate, fontSize: 13 }}>
        {error
          ? 'Showing your last available queue. Pull down to retry.'
          : updatedAt
            ? 'Updated ' +
              updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
              ' / Refreshes every 15 seconds'
            : 'Connecting to your queue...'}
      </Text>
      <ErrorText message={error} />

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
          <LinearGradient
            colors={[...gradients.ticket]}
            style={{ borderRadius: 30, padding: 24, overflow: 'hidden', gap: 22 }}
          >
            <HeroDecoration />
            <View
              style={{
                flexDirection: compact ? 'column' : 'row',
                alignItems: compact ? 'stretch' : 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{ color: '#C7E9EF', fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}
                >
                  YOUR PLACE IN LINE
                </Text>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 40,
                    fontWeight: '800',
                    letterSpacing: -1.5,
                  }}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {queue.ticketNumber}
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: compact ? 'row' : 'column',
                  justifyContent: 'space-between',
                  gap: compact ? 12 : 0,
                  backgroundColor: '#FFFFFF18',
                  borderWidth: 1,
                  borderColor: '#FFFFFF25',
                  borderRadius: 22,
                  padding: 14,
                }}
              >
                <Text style={{ color: colors.white, fontSize: 32, fontWeight: '800' }}>
                  {queue.patientsAhead}
                </Text>
                <Text style={{ color: '#D6EDF2', fontSize: 12 }}>People ahead</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <PulseDot color="#9AE3DC" />
              <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>
                {queue.onSite ? 'Checked in at hospital' : 'Waiting for your turn'}
              </Text>
            </View>
          </LinearGradient>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <GradientButton
              label="My ticket"
              variant="journey"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('LiveTicket')}
            />
            <GradientButton
              label="Updates"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
          {queue.slot ? (
            <QueueWaitForecast slot={queue.slot} queueLength={queue.patientsAhead} />
          ) : null}

          {queue.positionMovedAlert ? (
            <View style={styles.moved}>
              <AlertTriangle size={18} color={colors.amberDeep} />
              <Text style={styles.movedBody}>
                Your position moved back. A patient checked in on-site (QR verified) and was given
                priority.
              </Text>
            </View>
          ) : null}

          <Pressable style={styles.qrBar} onPress={() => navigation.navigate('CheckInQr')}>
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
  empty: { color: colors.slate, textAlign: 'center' },
  summaryCard: {
    paddingVertical: spacing.xl,
  },
  summaryRow: {
    flexWrap: 'wrap',
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    minWidth: 95,
    flex: 1,
    gap: 6,
  },
  caps: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: colors.slateSoft,
  },
  ticket: {
    fontSize: 32,
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
    fontSize: 32,
    fontWeight: '800',
    color: colors.navy,
  },
  circleLabel: {
    fontSize: 11,
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
    fontSize: 14,
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
    lineHeight: 24,
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
    fontSize: 14,
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
    flexShrink: 1,
    color: colors.slate,
    fontWeight: '700',
    fontSize: 14,
  },
});
