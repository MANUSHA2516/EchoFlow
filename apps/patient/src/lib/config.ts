import { Platform } from 'react-native';

/** Android emulator reaches host machine via 10.0.2.2; iOS simulator via localhost. */
const host =
  Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? `http://${host}:4000/api/v1`,
  wsUrl: process.env.EXPO_PUBLIC_WS_URL ?? `http://${host}:4000`,
  brand: 'EchoFlow',
  hospitalName: 'General Hospital',
  unitLabel: 'ECHO Unit · Patient Portal',
  /** When true, always use in-app demo store (no network). Set false to prefer live API. */
  forceDemo: (process.env.EXPO_PUBLIC_FORCE_DEMO ?? 'true') === 'true',
  otpDemoHint: 'Use code 123456 in demo mode',
};
