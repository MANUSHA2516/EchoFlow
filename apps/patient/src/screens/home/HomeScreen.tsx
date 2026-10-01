import { Text } from '../../components/AppText';
import { useCallback, useRef } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Bell, Clock3, UserRound } from 'lucide-react-native';
import { VisitChecklist } from '../../components/VisitChecklist';
import { Card } from '../../components/Card';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { firstName, initials } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { MainTabParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { dashboard, refreshDashboard, busy, error, usingDemo } = usePatient();
  const patient = dashboard?.patient;
  const queue = dashboard?.queue;
  const focusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!focusedOnce.current) {
        focusedOnce.current = true;
        return;
      }
      void refreshDashboard().catch(() => undefined);
    }, [refreshDashboard]),
  );

  if (!patient || !queue) {
    return (
      <Screen>
        <ErrorText message={error} />
        <GradientButton
          label="Refresh dashboard"
          variant="secondary"
          onPress={() => void refreshDashboard().catch(() => undefined)}
        />
        <Text style={styles.loading}>Loading dashboard…</Text>
      </Screen>
    );
  }

  const hasTicket = Boolean(queue.ticketNumber);

  return (
    <Screen
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0 }}
      refreshing={busy}
      onRefresh={() => {
        void refreshDashboard().catch(() => undefined);
      }}
    >
      <LinearGradient colors={[...gradients.header]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: '#C7E9EF', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 }}>
              YOUR CARE, SIMPLIFIED
            </Text>
            <Text style={styles.hello}>Hello, {firstName(patient.fullName)}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.avatar}>
              {patient.avatarUrl ? (
                <Image
                  source={{ uri: patient.avatarUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                <Text style={styles.avatarText}>{initials(patient.fullName)}</Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open notifications"
              style={styles.bell}
              onPress={() => navigation.navigate('Queue', { screen: 'Notifications' })}
            >
              <Bell color={colors.white} size={20} />
              {(dashboard?.unreadNotifications ?? 0) > 0 ? <View style={styles.dot} /> : null}
            </Pressable>
          </View>
        </View>
        <Text style={{ color: '#D6EDF2', marginTop: 18, maxWidth: 310 }}>
          Your next visit, a little easier. Keep your place and plan your day.
        </Text>
        {usingDemo && (
          <Text style={{ color: '#D6EDF2', fontSize: 12, marginTop: 10 }}>Demo workspace</Text>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <ErrorText message={error} />
        <View style={styles.row}>
          <Card style={styles.half}>
            <Text style={styles.meta}>Your queue number</Text>
            <Text style={styles.ticket}>{queue.ticketNumber ?? '—'}</Text>
          </Card>
          <LinearGradient colors={[...gradients.wait]} style={styles.waitCard}>
            <Text style={styles.waitMeta}>Predicted wait</Text>
            <Text style={styles.waitValue}>
              {queue.predictedWaitMinutes != null ? `${queue.predictedWaitMinutes} min` : '—'}
            </Text>
          </LinearGradient>
        </View>

        <Card>
          <View style={styles.liveRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>LIVE · CURRENTLY SERVING</Text>
            </View>
          </View>
          <Text style={styles.serving}>{queue.currentlyServing ?? '—'}</Text>
          <Text style={styles.ahead}>
            {hasTicket
              ? `${queue.patientsAhead} patients ahead of you`
              : `${queue.totalInQueue} patients in today’s queue`}
          </Text>
          <View style={styles.progressRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < Math.min(5, Math.max(1, 5 - queue.patientsAhead)) && styles.progressDotOn,
                ]}
              />
            ))}
            <Text style={styles.ofTotal}>of {queue.totalInQueue}</Text>
          </View>
        </Card>

        <GradientButton
          variant="journey"
          label={hasTicket ? 'View live ticket →' : 'Join today’s queue →'}
          onPress={() => {
            if (hasTicket) {
              navigation.navigate('Queue', { screen: 'LiveTicket' });
            } else {
              navigation.navigate('Queue', { screen: 'JoinQueue' });
            }
          }}
        />

        <View style={styles.row}>
          <Pressable style={styles.quick} onPress={() => navigation.navigate('History')}>
            <Clock3 size={18} color={colors.tealDeep} />
            <Text style={styles.quickText}>Visit history</Text>
          </Pressable>
          <Pressable
            style={styles.quick}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileHome' })}
          >
            <UserRound size={18} color={colors.tealDeep} />
            <Text style={styles.quickText}>Profile</Text>
          </Pressable>
        </View>

        <View style={styles.checkIn}>
          <Text style={styles.checkInTitle}>At the hospital now?</Text>
          <Text style={styles.checkInText}>On-site patients get priority in the queue.</Text>
          {hasTicket ? (
            <GradientButton
              variant="journey"
              label="Show check-in QR"
              onPress={() => navigation.navigate('Queue', { screen: 'CheckInQr' })}
            />
          ) : (
            <GradientButton
              variant="secondary"
              label="Join queue to check in"
              onPress={() => navigation.navigate('Queue', { screen: 'JoinQueue' })}
            />
          )}
        </View>
        <VisitChecklist />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xxxl,
    textAlign: 'center',
    color: colors.slate,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 44,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hello: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  body: {
    marginTop: -24,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    minWidth: 0,
    flex: 1,
  },
  meta: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  ticket: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '800',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  waitCard: {
    minWidth: 0,
    flex: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  waitMeta: {
    color: colors.tealDeep,
    fontSize: 14,
    fontWeight: '700',
  },
  waitValue: {
    marginTop: 6,
    color: colors.tealDeep,
    fontSize: 32,
    fontWeight: '800',
  },
  liveRow: {
    marginBottom: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amber,
  },
  liveLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate,
  },
  serving: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  ahead: {
    marginTop: 4,
    color: colors.slate,
  },
  progressRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  progressDotOn: {
    backgroundColor: colors.teal,
  },
  ofTotal: {
    marginLeft: spacing.sm,
    color: colors.slateSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  quick: {
    flex: 1,
    minHeight: 64,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.teal,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  quickText: {
    fontSize: 15,
    flexShrink: 1,
    color: colors.tealDeep,
    fontWeight: '700',
  },
  checkIn: {
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#B9DFE8',
    padding: spacing.lg,
    gap: spacing.md,
  },
  checkInTitle: {
    color: colors.tealDeep,
    fontWeight: '800',
    fontSize: 18,
  },
  checkInText: {
    color: colors.tealDeep,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: -4,
  },
});
