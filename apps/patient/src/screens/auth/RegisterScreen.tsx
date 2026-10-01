import { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  useEffect(() => {
    navigation.replace('Login', { mode: 'register' });
  }, [navigation]);
  return null;
}
