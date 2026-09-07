import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'echoflow.access';
const REFRESH_KEY = 'echoflow.refresh';

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  async save(accessToken: string, refreshToken: string) {
    await setItem(ACCESS_KEY, accessToken);
    await setItem(REFRESH_KEY, refreshToken);
  },
  async getAccess() {
    return getItem(ACCESS_KEY);
  },
  async getRefresh() {
    return getItem(REFRESH_KEY);
  },
  async clear() {
    await deleteItem(ACCESS_KEY);
    await deleteItem(REFRESH_KEY);
  },
};
