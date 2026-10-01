import { Text } from '../../components/AppText';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageSquare } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { formatPhoneDisplay } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PhoneOtp'>;

export function PhoneOtpScreen({ navigation }: Props) {
  const { pendingOtp, verifyOtp, resendOtp, busy, error, usingDemo, demoOtp } = usePatient();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);
  const hadChallenge = useRef(pendingOtp?.purpose === 'phone_change');

  const setDigit = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6 - index);
    const next = [...digits];
    next[index] = '';
    cleaned.split('').forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setDigits(next);
    if (cleaned && index < 5) inputs.current[Math.min(index + cleaned.length, 5)]?.focus();
  };

  useEffect(() => {
    if (pendingOtp?.purpose === 'phone_change') {
      hadChallenge.current = true;
    } else if (!hadChallenge.current) {
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
      </View>

      {usingDemo && (
        <Text style={{ textAlign: 'center', color: colors.tealDeep, fontSize: 14 }}>
          Demo verification code: {demoOtp}
        </Text>
      )}
      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChangeText={(value) => setDigit(i, value)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
                inputs.current[i - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={6 - i}
            accessibilityLabel={`Verification digit ${i + 1} of 6`}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            editable={!busy}
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
                if (busy) return;
                await resendOtp();
                setDigits(['', '', '', '', '', '']);
                inputs.current[0]?.focus();
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    color: colors.slate,
    fontSize: 16,
  },
  otpRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  otpBox: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    paddingHorizontal: 0,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
  },
  resend: {
    textAlign: 'center',
    color: colors.slate,
    fontSize: 15,
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
