import { Text } from '../../components/AppText';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, MapPin, Phone } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { formatDob, formatPhoneDisplay, initials } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen({ navigation }: Props) {
  const { dashboard, logout, busy, error } = usePatient();
  const patient = dashboard?.patient;

  if (!patient) {
    return (
      <Screen>
        <Text style={{ color: colors.slate }}>Loading profile…</Text>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <LinearGradient colors={[...gradients.header]} style={styles.header}>
        <View style={styles.avatar}>
          <>
            {patient.avatarUrl ? (
              <Image
                source={{ uri: patient.avatarUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 40 }}
              />
            ) : (
              <Text style={styles.avatarText}>{initials(patient.fullName)}</Text>
            )}
          </>
        </View>
        <Text style={styles.name}>{patient.fullName}</Text>
        <Text style={styles.nic}>{patient.nic}</Text>
        {patient.verified ? (
          <View style={styles.verified}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
        <View style={styles.chips}>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>{patient.totalVisits}</Text>
            <Text style={styles.chipLabel}>Visits</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>{patient.memberSinceYear}</Text>
            <Text style={styles.chipLabel}>Since</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipValue}>{patient.lastTicketNumber ?? '—'}</Text>
            <Text style={styles.chipLabel}>Last no.</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <ErrorText message={error} />
        <Card>
          <Detail
            icon={<Phone size={18} color={colors.teal} />}
            label="Phone"
            value={formatPhoneDisplay(patient.phoneE164)}
          />
          <Detail
            icon={<Calendar size={18} color={colors.blue} />}
            label="Date of birth"
            value={formatDob(patient.dateOfBirth)}
          />
          <Detail
            icon={<MapPin size={18} color={colors.amberDeep} />}
            label="Address"
            value={patient.address || 'Not set'}
            last
          />
        </Card>

        <GradientButton
          variant="secondary"
          label="Edit details"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <GradientButton
          variant="danger"
          label="Log out"
          loading={busy}
          onPress={() => void logout().catch(() => undefined)}
        />
      </View>
    </Screen>
  );
}

function Detail({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detail, !last && styles.detailBorder]}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  nic: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  verified: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  verifiedText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  chips: {
    width: '100%',
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  chipValue: {
    color: colors.white,
    fontWeight: '800',
  },
  chipLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  body: {
    marginTop: -20,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    marginTop: 2,
    color: colors.navy,
    fontWeight: '700',
  },
});
