import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock3, Lightbulb } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { StatusBadge } from '../../components/StatusBadge';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'CheckInQr'>;

export function CheckInQrScreen({ navigation }: Props) {
  const { getCheckIn, refreshCheckIn } = usePatient();
  const [payload, setPayload] = useState('');
  const [ticketNumber, setTicketNumber] = useState('—');
  const [expiresAt, setExpiresAt] = useState<number>(Date.now() + 300000);
  const [remaining, setRemaining] = useState('05:00');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (refresh = false) => {
      setBusy(true);
      try {
        const data = refresh ? await refreshCheckIn() : await getCheckIn();
        setPayload(data.payload);
        setTicketNumber(data.ticketNumber);
        setExpiresAt(new Date(data.expiresAt).getTime());
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

  return (
    <Screen>
      <View style={styles.topRow}>
        <StatusBadge label="CHECK-IN QR" tone="teal" />
        <Text style={styles.unit}>ECHO UNIT</Text>
      </View>

      <Text style={styles.title}>Show this at reception</Text>
      <Text style={styles.intro}>Staff will scan it to confirm you’re on-site</Text>

      <View style={styles.qrCard}>
        {payload ? (
          <View style={styles.qrWrap}>
            <QRCode
              value={payload}
              size={220}
              color={colors.navy}
              backgroundColor={colors.white}
            />
            <LinearGradient colors={[...gradients.journeyButton]} style={styles.qrLogo}>
              <Text style={styles.qrLogoText}>EF</Text>
            </LinearGradient>
          </View>
        ) : (
          <Text style={styles.loading}>Preparing code…</Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.expires}>
            <Clock3 size={14} color={colors.blue} />
            <Text style={styles.expiresText}>Expires in {remaining}</Text>
          </View>
          <Text style={styles.ticket}>{ticketNumber}</Text>
        </View>
      </View>

      <View style={styles.next}>
        <View style={styles.nextHead}>
          <Lightbulb size={16} color={colors.blue} />
          <Text style={styles.nextTitle}>What happens next</Text>
        </View>
        <Text style={styles.step}>1. Staff scans this code at reception</Text>
        <Text style={styles.step}>2. Your GPS location is checked against the hospital</Text>
        <Text style={styles.step}>3. You’re marked on-site and may move up the queue</Text>
        <Text style={styles.demoNote}>
          Demo mode: staff verification is simulated — not a live GPS geofence.
        </Text>
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.slateSoft,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  intro: {
    color: colors.slate,
    lineHeight: 20,
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
    fontSize: 14,
  },
  loading: { color: colors.slate },
  metaRow: {
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
    fontSize: 12,
  },
  ticket: {
    fontWeight: '800',
    fontSize: 22,
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
    lineHeight: 20,
  },
  demoNote: {
    marginTop: spacing.sm,
    color: colors.amberDeep,
    fontSize: 12,
    fontWeight: '600',
  },
});
