import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CreditCard, Phone } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { TextField } from '../../components/TextField';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/spacing';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, busy, error, clearError } = usePatient();
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <AuthShell badge="SECURE LOGIN">
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Log in</Text>
        </View>
        <Pressable
          style={styles.tab}
          onPress={() => {
            clearError();
            navigation.navigate('Register');
          }}
        >
          <Text style={styles.tabText}>Register</Text>
        </Pressable>
      </View>

      <TextField
        label="NIC Number"
        value={nic}
        onChangeText={setNic}
        keyboardType="number-pad"
        autoCapitalize="none"
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

      <ErrorText message={error} />

      <GradientButton
        label="Continue"
        loading={busy}
        onPress={async () => {
          try {
            await login(nic.trim(), phone.trim());
            navigation.navigate('VerifyOtp');
          } catch {
            /* surfaced via context */
          }
        }}
      />

      <Pressable
        onPress={() => {
          clearError();
          navigation.navigate('Register');
        }}
      >
        <Text style={styles.link}>
          New patient? <Text style={styles.linkStrong}>Register with your NIC</Text> in one
          step.
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
