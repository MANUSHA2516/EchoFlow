import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { GradientButton } from '../../components/GradientButton';
import { config } from '../../lib/config';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerificationSuccess'>;

export function VerificationSuccessScreen({ navigation, route }: Props) {
  const { purpose } = route.params;

  return (
    <AuthShell badge="VERIFIED" badgeTone="green" showBrand={false}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <CheckCircle2 color={colors.green} size={40} />
        </View>
        <Text style={styles.title}>Verification successful</Text>
        <Text style={styles.sub}>
          {config.hospitalName} · Echo Unit
        </Text>
        <Text style={styles.body}>
          Your phone number has been verified and your account is ready to use.
        </Text>
      </View>

      <GradientButton
        label="Back to login →"
        onPress={() => navigation.navigate('Login')}
      />

      {purpose === 'phone_change' ? (
        <Text style={styles.note}>
          Your notification and OTP number has been updated.
        </Text>
      ) : (
        <Text style={styles.note}>
          Sign in with your NIC and verified phone to open the patient portal.
        </Text>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
    textAlign: 'center',
  },
  sub: {
    color: colors.slate,
    fontWeight: '600',
  },
  body: {
    textAlign: 'center',
    color: colors.slate,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  note: {
    textAlign: 'center',
    color: colors.slateSoft,
    fontSize: 13,
  },
});
