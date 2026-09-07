import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientButton } from '../../components/GradientButton';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { usePatient } from '../../lib/PatientContext';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'QueueHome'>;

export function QueueHomeScreen({ navigation }: Props) {
  const { dashboard } = usePatient();
  const hasTicket = Boolean(dashboard?.queue.ticketNumber);

  return (
    <Screen>
      <ScreenHeader
        title="Queue"
        subtitle="Join, track, or leave today’s ECHO queue"
      />
      <Text style={styles.lead}>
        {hasTicket
          ? `Active ticket ${dashboard?.queue.ticketNumber}. Live updates stay open while you wait.`
          : 'You are not in today’s queue yet. Join remotely and we will track your place.'}
      </Text>
      {hasTicket ? (
        <>
          <GradientButton
            variant="journey"
            label="Open live ticket"
            onPress={() => navigation.navigate('LiveTicket')}
          />
          <GradientButton
            variant="secondary"
            label="Live queue tracking"
            onPress={() => navigation.navigate('LiveQueue')}
          />
          <GradientButton
            variant="secondary"
            label="Show check-in QR"
            onPress={() => navigation.navigate('CheckInQr')}
          />
        </>
      ) : (
        <GradientButton
          variant="journey"
          label="Join today’s queue →"
          onPress={() => navigation.navigate('JoinQueue')}
        />
      )}
      <View style={{ height: 8 }} />
      <GradientButton
        variant="ghost"
        label="Notifications"
        onPress={() => navigation.navigate('Notifications')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    color: '#64748B',
    lineHeight: 21,
  },
});
