import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageSquare } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { StatusBadge } from '../../components/StatusBadge';
import { config } from '../../lib/config';
import { formatPhoneDisplay } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PhoneOtp'>;

export function PhoneOtpScreen({ navigation }: Props) {
  const { pendingOtp, verifyOtp, resendOtp, busy, error, demoOtp } = usePatient();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!pendingOtp || pendingOtp.purpose !== 'phone_change') {
      navigation.replace('UpdatePhone');
    }
  }, [pendingOtp, navigation]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join('');

  return (
    <AuthShell badge="VERIFY OTP" badgeTone="blue" showBrand={false} showFooter={false}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MessageSquare color={colors.teal} size={28} />
        </View>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Code sent to {pendingOtp ? formatPhoneDisplay(pendingOtp.phoneE164) : '—'}
        </Text>
        {config.forceDemo ? (
          <StatusBadge label={`Demo OTP ${demoOtp}`} tone="amber" style={{ marginTop: 8 }} />
        ) : null}
      </View>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChangeText={(value) => {
              const cleaned = value.replace(/\D/g, '').slice(-1);
              const next = [...digits];
              next[i] = cleaned;
              setDigits(next);
              if (cleaned && i < 5) inputs.current[i + 1]?.focus();
            }}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.otpBox}
            selectTextOnFocus
          />
        ))}
      </View>

      <Text style={styles.resend}>
        Didn’t get a code?{' '}
        {seconds > 0 ? (
          <Text style={styles.countdown}>
            Resend in 00:{String(seconds).padStart(2, '0')}
          </Text>
        ) : (
          <Text
            style={styles.resendAction}
            onPress={async () => {
              try {
                await resendOtp();
                setSeconds(30);
              } catch {
                /* context */
              }
            }}
          >
            Resend now
          </Text>
        )}
      </Text>

      <ErrorText message={error} />

      <GradientButton
        label="Verify & continue →"
        loading={busy}
        disabled={code.length !== 6}
        onPress={async () => {
          try {
            await verifyOtp(code);
            navigation.replace('ProfileHome');
          } catch {
            /* context */
          }
        }}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    color: colors.slate,
    fontSize: 14,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  resend: {
    textAlign: 'center',
    color: colors.slate,
    fontSize: 13,
  },
  countdown: {
    fontWeight: '700',
    color: colors.navy,
  },
  resendAction: {
    fontWeight: '800',
    color: colors.tealDeep,
  },
});
