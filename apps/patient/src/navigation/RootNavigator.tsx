import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock3, FolderOpen, Home, UserRound } from 'lucide-react-native';
import { useMotion } from '../lib/MotionContext';
import { TabGlyph } from '../components/Motion';
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
  const motion = useMotion();
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false, animation: motion.enabled ? 'fade' : 'none' }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <AuthStack.Screen name="VerificationSuccess" component={VerificationSuccessScreen} />
    </AuthStack.Navigator>
  );
}

function QueueNavigator() {
  const motion = useMotion();
  return (
    <QueueStack.Navigator
      initialRouteName="LiveQueue"
      screenOptions={{ headerShown: false, animation: motion.enabled ? 'fade' : 'none' }}
    >
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
  const motion = useMotion();
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false, animation: motion.enabled ? 'fade' : 'none' }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="UpdatePhone" component={UpdatePhoneScreen} />
      <ProfileStack.Screen name="PhoneOtp" component={PhoneOtpScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.slateSoft,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 8,
          shadowColor: colors.tealDeep,
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          backgroundColor: colors.white,
          height: 72 + insets.bottom,
          paddingBottom: Math.max(6, insets.bottom),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
          return <TabGlyph icon={Icon} color={color} size={size} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Queue"
        component={QueueNavigator}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            const queueState = navigation
              .getState()
              .routes.find((route) => route.name === 'Queue')?.state;
            if (queueState?.key) {
              if (queueState.routes[queueState.index ?? 0]?.name !== 'LiveQueue') {
                navigation.dispatch({
                  ...CommonActions.reset({ index: 0, routes: [{ name: 'LiveQueue' }] }),
                  target: queueState.key,
                });
              }
              navigation.dispatch(CommonActions.navigate({ name: 'Queue' }));
            } else {
              navigation.navigate('Queue', { screen: 'LiveQueue' });
            }
          },
        })}
      />
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
    <NavigationContainer>{authenticated ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>
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
