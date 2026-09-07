import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Phone } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { TextField } from '../../components/TextField';
import { formatPhoneDisplay, localPhoneFromE164 } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'UpdatePhone'>;

export function UpdatePhoneScreen({ navigation }: Props) {
  const { dashboard, requestPhoneChange, busy, error } = usePatient();
  const patient = dashboard?.patient;
  const [phone, setPhone] = useState('');

  if (!patient) {
    return (
      <AuthShell badge="EDIT DETAILS" badgeTone="blue" showBrand={false} showFooter={false}>
        <Text style={{ color: colors.slate }}>Loading…</Text>
      </AuthShell>
    );
  }

  return (
    <AuthShell badge="EDIT DETAILS" badgeTone="blue" showBrand={false} showFooter={false}>
      <Text style={styles.title}>Update phone number</Text>
      <Text style={styles.subtitle}>Patient Portal · Security</Text>
      <Text style={styles.body}>
        We’ll text a one-time code to confirm any changes to this number.
      </Text>

      <TextField
        label="Current number"
        value={formatPhoneDisplay(patient.phoneE164)}
        locked
        icon={<Phone size={18} color={colors.slate} />}
      />
      <TextField
        label="New phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder={localPhoneFromE164(patient.phoneE164)}
        prefix="+94"
        icon={<Phone size={18} color={colors.slate} />}
      />

      <ErrorText message={error} />

      <GradientButton
        label="Send verification code →"
        loading={busy}
        onPress={async () => {
          try {
            await requestPhoneChange(phone.trim());
            navigation.navigate('PhoneOtp');
          } catch {
            /* context */
          }
        }}
      />
      <GradientButton
        variant="ghost"
        label="Cancel and go back"
        onPress={() => navigation.goBack()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 8,
  },
  subtitle: {
    color: colors.slate,
    fontWeight: '600',
  },
  body: {
    color: colors.slate,
    lineHeight: 20,
  },
});
