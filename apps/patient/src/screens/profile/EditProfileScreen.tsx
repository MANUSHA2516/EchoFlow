import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Calendar,
  Camera,
  CreditCard,
  Lock,
  MapPin,
  Pencil,
  Phone,
  User,
} from 'lucide-react-native';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TextField } from '../../components/TextField';
import { formatDobInput, initials, localPhoneFromE164 } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors, gradients } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { dashboard, updateProfile, busy, error } = usePatient();
  const patient = dashboard?.patient;

  const [fullName, setFullName] = useState(patient?.fullName ?? '');
  const [dobDisplay, setDobDisplay] = useState(
    patient ? formatDobInput(patient.dateOfBirth) : '',
  );
  const [address, setAddress] = useState(patient?.address ?? '');
  const [photoUri, setPhotoUri] = useState(patient?.avatarUrl);

  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled) setPhotoUri(result.assets[0].uri);
    } catch {
      Alert.alert('Photo unavailable', 'Please try choosing a photo again.');
    }
  };

  if (!patient) {
    return (
      <Screen>
        <Text style={{ color: colors.slate }}>Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Edit profile" onBack={() => navigation.goBack()} />

      <Pressable style={styles.avatarWrap} onPress={choosePhoto} accessibilityRole="button" accessibilityLabel="Choose profile photo">
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <LinearGradient colors={[...gradients.avatar]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(fullName || patient.fullName)}</Text>
          </LinearGradient>
        )}
        <View style={styles.camera} pointerEvents="none">
          <Camera size={14} color={colors.white} />
        </View>
        <Text style={styles.photoHint}>Change photo</Text>
      </Pressable>
      {photoUri ? (
        <Pressable onPress={() => setPhotoUri(undefined)} accessibilityRole="button">
          <Text style={styles.removePhoto}>Remove photo</Text>
        </Pressable>
      ) : null}

      <TextField
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        icon={<User size={18} color={colors.slate} />}
        right={<Pencil size={16} color={colors.slateSoft} />}
      />
      <TextField
        label="NIC number"
        value={patient.nic}
        locked
        icon={<CreditCard size={18} color={colors.slate} />}
        right={<Lock size={16} color={colors.slateSoft} />}
      />
      <Pressable onPress={() => navigation.navigate('UpdatePhone')}>
        <TextField
          label="Phone"
          value={localPhoneFromE164(patient.phoneE164)}
          editable={false}
          prefix="+94"
          icon={<Phone size={18} color={colors.slate} />}
          right={<Pencil size={16} color={colors.teal} />}
        />
      </Pressable>
      <TextField
        label="Date of birth"
        value={dobDisplay}
        onChangeText={setDobDisplay}
        placeholder="DD / MM / YYYY"
        icon={<Calendar size={18} color={colors.slate} />}
        right={<Pencil size={16} color={colors.slateSoft} />}
      />
      <TextField
        label="Address"
        value={address}
        onChangeText={setAddress}
        icon={<MapPin size={18} color={colors.slate} />}
        right={<Pencil size={16} color={colors.slateSoft} />}
      />

      <ErrorText message={error} />

      <GradientButton
        variant="journey"
        label="Save changes"
        loading={busy}
        onPress={async () => {
          try {
            const parts = dobDisplay.split(/[/\-.\s]+/).filter(Boolean);
            let iso = patient.dateOfBirth;
            if (parts.length === 3) {
              const [dd, mm, yyyy] = parts;
              iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
            }
            await updateProfile({
              fullName: fullName.trim(),
              dateOfBirth: iso,
              address: address.trim(),
              avatarUrl: photoUri ?? '',
            });
            navigation.goBack();
          } catch {
            /* context */
          }
        }}
      />
      <GradientButton
        variant="secondary"
        label="Cancel"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  camera: {
    position: 'absolute',
    right: 3,
    top: 63,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  photoHint: {
    marginTop: spacing.sm,
    color: colors.blue,
    fontSize: 12,
    fontWeight: '700',
  },
  removePhoto: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    color: colors.red,
    fontSize: 12,
    fontWeight: '700',
  },
});
