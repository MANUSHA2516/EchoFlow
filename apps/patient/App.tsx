import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MotionProvider } from './src/lib/MotionContext';
import { PatientProvider } from './src/lib/PatientContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MotionProvider>
          <PatientProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </PatientProvider>
        </MotionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
