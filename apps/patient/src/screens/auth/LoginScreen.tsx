import { Text } from '../../components/AppText';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, CreditCard, Phone, User } from 'lucide-react-native';
import { AuthShell } from '../../components/AuthShell';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { TextField } from '../../components/TextField';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/spacing';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const { login, register, busy, error, clearError } = usePatient();
  const [isRegistering, setIsRegistering] = useState(route.params?.mode === 'register');
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const switchMode = (registerMode: boolean) => {
    setIsRegistering(registerMode);
    setFormError(null);
    clearError();
  };

  const submit = async () => {
    setFormError(null);
    const cleanNic = nic.trim().toUpperCase();
    const phoneDigits = phone.replace(/\D/g, '');
    const localPhone = phoneDigits.startsWith('94')
      ? phoneDigits.slice(2)
      : phoneDigits.startsWith('0')
        ? phoneDigits.slice(1)
        : phoneDigits;

    if (!/^\d{12}$|^\d{9}[VX]$/.test(cleanNic)) {
      setFormError('Enter a valid 12-digit NIC or 9-digit NIC ending in V or X.');
      return;
    }
    if (!/^7\d{8}$/.test(localPhone)) {
      setFormError('Enter a valid Sri Lankan mobile number.');
      return;
    }

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          setFormError('Enter your full name.');
          return;
        }
        const parts = dob
          .trim()
          .split(/[/.\-\s]+/)
          .filter(Boolean);
        if (parts.length !== 3) {
          setFormError('Enter your date of birth as DD / MM / YYYY.');
          return;
        }
        const [day, month, year] = parts.map(Number);
        const date = new Date(year, month - 1, day);
        if (
          !Number.isInteger(day) ||
          !Number.isInteger(month) ||
          !Number.isInteger(year) ||
          year < 1900 ||
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day ||
          date > new Date()
        ) {
          setFormError('Enter a real date of birth that is not in the future.');
          return;
        }
        await register({
          fullName: fullName.trim(),
          nic: cleanNic,
          phoneLocal: localPhone,
          dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        });
      } else {
        await login(cleanNic, localPhone);
      }
      navigation.navigate('VerifyOtp');
    } catch {
      // The request error is shown in the form.
    }
  };

  return (
    <AuthShell
      badge={isRegistering ? 'NEW PATIENT' : 'SECURE LOGIN'}
      badgeTone={isRegistering ? 'blue' : 'mint'}
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>
          {isRegistering ? 'Your care starts here.' : 'Welcome back.'}
        </Text>
        <Text style={{ color: colors.slate }}>
          {isRegistering
            ? 'Create your patient account in a few simple steps.'
            : 'Less waiting. More peace of mind. Sign in to plan your visit.'}
        </Text>
      </View>
      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: !isRegistering }}
          style={[styles.tab, !isRegistering && styles.tabActive]}
          onPress={() => switchMode(false)}
        >
          <Text style={[styles.tabText, !isRegistering && styles.tabTextActive]}>Log in</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isRegistering }}
          style={[styles.tab, isRegistering && styles.tabActive]}
          onPress={() => switchMode(true)}
        >
          <Text style={[styles.tabText, isRegistering && styles.tabTextActive]}>Register</Text>
        </Pressable>
      </View>

      {isRegistering ? (
        <TextField
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Kasun Perera"
          autoCapitalize="words"
          icon={<User size={18} color={colors.slate} />}
        />
      ) : null}

      <TextField
        label="NIC Number"
        value={nic}
        onChangeText={setNic}
        keyboardType="default"
        autoCapitalize="characters"
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

      {isRegistering ? (
        <TextField
          label="Date of Birth"
          value={dob}
          onChangeText={setDob}
          placeholder="DD / MM / YYYY"
          keyboardType="numbers-and-punctuation"
          icon={<Calendar size={18} color={colors.slate} />}
        />
      ) : null}

      <ErrorText message={formError ?? error} />

      <GradientButton
        label={isRegistering ? 'Create account' : 'Continue'}
        loading={busy}
        onPress={() => void submit()}
      />

      <Pressable onPress={() => switchMode(!isRegistering)}>
        <Text style={styles.link}>
          {isRegistering ? 'Already registered? ' : 'New patient? '}
          <Text style={styles.linkStrong}>
            {isRegistering ? 'Log in with your NIC' : 'Register with your NIC'}
          </Text>
          {isRegistering ? '' : ' in one step.'}
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
    paddingVertical: 14,
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
    fontSize: 15,
    lineHeight: 24,
  },
  linkStrong: {
    color: colors.tealDeep,
    fontWeight: '800',
  },
});
