import { Text } from '../../components/AppText';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, Lightbulb } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { GradientButton } from '../../components/GradientButton';
import { ErrorText } from '../../components/ErrorText';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'CheckInQr'>;

export function CheckInQrScreen({ navigation }: Props) {
  const { getCheckIn, refreshCheckIn, usingDemo } = usePatient();
  const { width } = useWindowDimensions();
  const qrSize = Math.min(220, width - 88);
  const [payload, setPayload] = useState('');
  const [ticketNumber, setTicketNumber] = useState('—');
  const [expiresAt, setExpiresAt] = useState<number>(Date.now() + 300000);
  const [remaining, setRemaining] = useState('05:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expiredRefreshAttempted = useRef(false);

  const load = useCallback(
    async (refresh = false) => {
      setBusy(true);
      setError(null);
      try {
        const data = refresh ? await refreshCheckIn() : await getCheckIn();
        setPayload(data.payload);
        setTicketNumber(data.ticketNumber);
        setExpiresAt(new Date(data.expiresAt).getTime());
        expiredRefreshAttempted.current = false;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load your check-in code.');
      } finally {
        setBusy(false);
      }
    },
    [getCheckIn, refreshCheckIn],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, expiresAt - Date.now());
      const total = Math.floor(ms / 1000);
      const mm = String(Math.floor(total / 60)).padStart(2, '0');
      const ss = String(total % 60).padStart(2, '0');
      setRemaining(`${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (payload && remaining === '00:00' && !busy && !expiredRefreshAttempted.current) {
      expiredRefreshAttempted.current = true;
      void load(true);
    }
  }, [busy, load, payload, remaining]);

  return (
    <Screen>
      <ScreenHeader title="Check-in QR" onBack={() => navigation.goBack()} />
      <View style={styles.topRow}>
        <StatusBadge label="CHECK-IN QR" tone="teal" />
        <Text style={styles.unit}>ECHO UNIT</Text>
      </View>

      <Text style={styles.title}>Show this at reception</Text>
      <Text style={styles.intro}>Staff will scan it to confirm you’re on-site</Text>

      <View style={styles.qrCard}>
        {payload && remaining !== '00:00' && !busy ? (
          <View style={styles.qrWrap}>
            <QRCode
              value={payload}
              size={qrSize}
              color={colors.navy}
              backgroundColor={colors.white}
            />
          </View>
        ) : (
          <View style={styles.loading}>
            {busy ? <ActivityIndicator color={colors.teal} /> : null}
            <Text style={styles.loadingText}>
              {busy
                ? 'Preparing code…'
                : remaining === '00:00'
                  ? 'Code expired. Refresh to try again.'
                  : 'No code loaded'}
            </Text>
          </View>
        )}
        <View style={styles.metaRow}>
          <View style={styles.expires}>
            <Clock3 size={14} color={colors.blue} />
            <Text style={styles.expiresText}>Expires in {remaining}</Text>
          </View>
          <Text style={styles.ticket}>{ticketNumber}</Text>
        </View>
      </View>

      <ErrorText message={error} />

      <View style={styles.next}>
        <View style={styles.nextHead}>
          <Lightbulb size={16} color={colors.blue} />
          <Text style={styles.nextTitle}>What happens next</Text>
        </View>
        <Text style={styles.step}>1. Staff scans this code at reception</Text>
        <Text style={styles.step}>2. Your GPS location is checked against the hospital</Text>
        <Text style={styles.step}>3. You’re marked on-site and may move up the queue</Text>
        {usingDemo ? (
          <Text style={styles.demoNote}>
            Demo mode: staff verification is simulated — not a live GPS geofence.
          </Text>
        ) : null}
      </View>

      <GradientButton
        variant="secondary"
        label="Refresh code"
        loading={busy}
        onPress={() => void load(true)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unit: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.slateSoft,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
  },
  intro: {
    color: colors.slate,
    lineHeight: 24,
    marginTop: -8,
  },
  qrCard: {
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
  },
  qrWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  qrLogoText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 16,
  },
  loading: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: { color: colors.slate },
  metaRow: {
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expires: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blueSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  expiresText: {
    color: colors.blue,
    fontWeight: '700',
    fontSize: 14,
  },
  ticket: {
    flexShrink: 0,
    fontWeight: '800',
    fontSize: 26,
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  next: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nextTitle: {
    fontWeight: '800',
    color: colors.navy,
  },
  step: {
    color: colors.slate,
    lineHeight: 24,
  },
  demoNote: {
    marginTop: spacing.sm,
    color: colors.amberDeep,
    fontSize: 14,
    fontWeight: '600',
  },
});
