import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: { mode?: 'login' | 'register' } | undefined;
  Register: undefined;
  VerifyOtp: undefined;
  VerificationSuccess: { purpose: 'login' | 'register' | 'phone_change' };
};

export type QueueStackParamList = {
  QueueHome: undefined;
  JoinQueue: undefined;
  LiveTicket: undefined;
  LiveQueue: undefined;
  CheckInQr: undefined;
  Notifications: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  UpdatePhone: undefined;
  PhoneOtp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Queue: NavigatorScreenParams<QueueStackParamList>;
  History: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
