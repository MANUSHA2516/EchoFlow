import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bell,
  CheckCircle2,
  MapPin,
  MoveDown,
  Users,
} from 'lucide-react-native';
import { NotificationType } from '@echoflow/types';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { relativeTime } from '../../lib/format';
import { usePatient } from '../../lib/PatientContext';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import type { QueueStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<QueueStackParamList, 'Notifications'>;

function iconFor(type: NotificationType) {
  switch (type) {
    case NotificationType.PositionMoved:
      return <MoveDown size={18} color={colors.amberDeep} />;
    case NotificationType.Proximity:
      return <Users size={18} color={colors.blue} />;
    case NotificationType.CheckedIn:
      return <MapPin size={18} color={colors.teal} />;
    case NotificationType.QueueConfirmed:
      return <CheckCircle2 size={18} color={colors.green} />;
    default:
      return <Bell size={18} color={colors.slate} />;
  }
}

export function NotificationsScreen({ navigation }: Props) {
  const { notifications, loadNotifications, markNotificationsRead, busy } = usePatient();

  useEffect(() => {
    void loadNotifications().then(() => markNotificationsRead());
  }, [loadNotifications, markNotificationsRead]);

  return (
    <Screen
      refreshing={busy}
      onRefresh={() => {
        void loadNotifications();
      }}
    >
      <ScreenHeader
        title="Notifications"
        subtitle="Updates about your place in the queue"
        onBack={() => navigation.goBack()}
      />

      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        notifications.map((n) => {
          const unread = !n.readAt;
          return (
            <View
              key={n.id}
              style={[styles.card, unread && styles.cardUnread]}
            >
              <View style={styles.icon}>{iconFor(n.type)}</View>
              <View style={styles.body}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.detail}>{n.body}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.time}>{relativeTime(n.createdAt)}</Text>
                {unread ? <View style={styles.dot} /> : null}
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.slate },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  cardUnread: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  title: {
    fontWeight: '800',
    color: colors.navy,
  },
  detail: {
    color: colors.slate,
    lineHeight: 18,
    fontSize: 13,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  time: {
    color: colors.slateSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
});
