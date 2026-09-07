import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, CreditCard, Phone, User } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { TextField } from '../../components/TextField';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register, busy, error, clearError } = usePatient();
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');

  return (
    <AuthShell badge="NEW PATIENT" badgeTone="blue">
      <View style={styles.tabs}>
        <Pressable
          style={styles.tab}
          onPress={() => {
            clearError();
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.tabText}>Log in</Text>
        </Pressable>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Register</Text>
        </View>
      </View>

      <TextField
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Kasun Perera"
        icon={<User size={18} color={colors.slate} />}
      />
      <TextField
        label="NIC Number"
        value={nic}
        onChangeText={setNic}
        keyboardType="number-pad"
        placeholder="200012345678"
        icon={<CreditCard size={18} color={colors.slate} />}
      />
      <TextField
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="71 234 5678"
        prefix="+94"
        icon={<Phone size={18} color={colors.slate} />}
      />
      <TextField
        label="Date of Birth"
        value={dob}
        onChangeText={setDob}
        placeholder="DD / MM / YYYY"
        icon={<Calendar size={18} color={colors.slate} />}
      />

      <ErrorText message={error} />

      <GradientButton
        label="Create account →"
        loading={busy}
        onPress={async () => {
          try {
            const parts = dob.split(/[/\-.\s]+/).filter(Boolean);
            let iso = dob;
            if (parts.length === 3) {
              const [dd, mm, yyyy] = parts;
              iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            }
            await register({
              fullName,
              nic: nic.trim(),
              phoneLocal: phone.trim(),
              dateOfBirth: iso,
            });
            navigation.navigate('VerifyOtp');
          } catch {
            /* context */
          }
        }}
      />

      <Pressable
        onPress={() => {
          clearError();
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.link}>
          Already registered? <Text style={styles.linkStrong}>Log in with your NIC</Text>{' '}
          instead.
        </Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.teal,
  },
  tabText: {
    fontWeight: '700',
    color: colors.slate,
  },
  tabTextActive: {
    color: colors.white,
  },
  link: {
    textAlign: 'center',
    color: colors.slate,
    fontSize: 13,
    lineHeight: 20,
  },
  linkStrong: {
    color: colors.tealDeep,
    fontWeight: '800',
  },
});
