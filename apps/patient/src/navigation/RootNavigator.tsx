import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  Clock3,
  FolderOpen,
  Home,
  UserRound,
} from 'lucide-react-native';
import { usePatient } from '../lib/PatientContext';
import { colors } from '../theme/colors';
import type {
  AuthStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  QueueStackParamList,
} from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { VerificationSuccessScreen } from '../screens/auth/VerificationSuccessScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { QueueHomeScreen } from '../screens/queue/QueueHomeScreen';
import { JoinQueueScreen } from '../screens/queue/JoinQueueScreen';
import { LiveTicketScreen } from '../screens/queue/LiveTicketScreen';
import { LiveQueueScreen } from '../screens/queue/LiveQueueScreen';
import { CheckInQrScreen } from '../screens/queue/CheckInQrScreen';
import { NotificationsScreen } from '../screens/queue/NotificationsScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UpdatePhoneScreen } from '../screens/profile/UpdatePhoneScreen';
import { PhoneOtpScreen } from '../screens/profile/PhoneOtpScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const QueueStack = createNativeStackNavigator<QueueStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <AuthStack.Screen
        name="VerificationSuccess"
        component={VerificationSuccessScreen}
      />
    </AuthStack.Navigator>
  );
}

function QueueNavigator() {
  return (
    <QueueStack.Navigator screenOptions={{ headerShown: false }}>
      <QueueStack.Screen name="QueueHome" component={QueueHomeScreen} />
      <QueueStack.Screen name="JoinQueue" component={JoinQueueScreen} />
      <QueueStack.Screen name="LiveTicket" component={LiveTicketScreen} />
      <QueueStack.Screen name="LiveQueue" component={LiveQueueScreen} />
      <QueueStack.Screen name="CheckInQr" component={CheckInQrScreen} />
      <QueueStack.Screen name="Notifications" component={NotificationsScreen} />
    </QueueStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="UpdatePhone" component={UpdatePhoneScreen} />
      <ProfileStack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.slateSoft,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const Icon =
            route.name === 'Home'
              ? Home
              : route.name === 'Queue'
                ? Clock3
                : route.name === 'History'
                  ? FolderOpen
                  : UserRound;
          return (
            <View
              style={{
                backgroundColor: focused ? colors.blueSoft : 'transparent',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Icon color={color} size={size} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Queue" component={QueueNavigator} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { booting, authenticated } = usePatient();

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {authenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
