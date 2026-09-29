import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageSquare } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { EcgWave } from '../../components/EcgWave';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { StatusBadge } from '../../components/StatusBadge';
import { config } from '../../lib/config';
import { formatPhoneDisplay } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;

export function VerifyOtpScreen({ navigation }: Props) {
  const { pendingOtp, verifyOtp, resendOtp, busy, error, demoOtp } = usePatient();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);
  const hadChallenge = useRef(Boolean(pendingOtp));

  useEffect(() => {
    if (pendingOtp) {
      hadChallenge.current = true;
    } else if (!hadChallenge.current) {
      navigation.replace('Login');
    }
  }, [pendingOtp, navigation]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join('');

  const setDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6 - index);
    const next = [...digits];
    cleaned.split('').forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setDigits(next);
    if (cleaned && index < 5) inputs.current[Math.min(index + cleaned.length, 5)]?.focus();
  };

  return (
    <AuthShell badge="VERIFY OTP" badgeTone="teal" showBrand={false}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MessageSquare color={colors.tealDeep} size={28} />
        </View>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.portal}>ECHO UNIT · PATIENT PORTAL</Text>
        <Text style={styles.subtitle}>
          Code sent to {pendingOtp ? formatPhoneDisplay(pendingOtp.phoneE164) : '—'}
        </Text>
        <EcgWave width={260} height={32} />
        {config.forceDemo ? <StatusBadge label={`Demo OTP ${demoOtp}`} tone="amber" /> : null}
      </View>

      <Text style={styles.codeLabel}>VERIFICATION CODE</Text>
      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChangeText={(v) => setDigit(i, v)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
                inputs.current[i - 1]?.focus();
              }
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
          <Text style={styles.countdown}>Resend in 00:{String(seconds).padStart(2, '0')}</Text>
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
            const purpose = await verifyOtp(code);
            navigation.replace('VerificationSuccess', { purpose });
          } catch {
            /* context */
          }
        }}
      />

      <Pressable
        onPress={() => {
          if (pendingOtp?.purpose === 'phone_change') {
            navigation.goBack();
            return;
          }
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.edit}>Wrong number? Edit phone number</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: '#B9DFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  portal: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.slateSoft,
  },
  subtitle: {
    color: colors.slate,
    fontSize: 14,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.slate,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  edit: {
    textAlign: 'center',
    color: colors.tealDeep,
    fontWeight: '700',
    fontSize: 13,
  },
});
