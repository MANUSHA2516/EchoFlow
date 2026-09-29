import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, CheckCircle2, MapPin, MoveDown, Users } from 'lucide-react-native';
import { NotificationType } from '@echoflow/types';
import { Screen } from '../../components/Screen';
import { ErrorText } from '../../components/ErrorText';
import { GradientButton } from '../../components/GradientButton';
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
  const { notifications, loadNotifications, markNotificationsRead, error } = usePatient();
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (markRead = false) => {
      setLoading(true);
      try {
        await loadNotifications();
        if (markRead) await markNotificationsRead();
      } catch {
        // Render the shared request error below and keep the screen usable.
      } finally {
        setLoading(false);
      }
    },
    [loadNotifications, markNotificationsRead],
  );

  useFocusEffect(
    useCallback(() => {
      void load(true);
    }, [load]),
  );

  return (
    <Screen refreshing={loading} onRefresh={() => void load()}>
      <ScreenHeader
        title="Notifications"
        subtitle="Updates about your place in the queue"
        onBack={() => navigation.goBack()}
      />

      <ErrorText message={error} />

      {loading && notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.teal} />
          <Text style={styles.empty}>Loading notifications…</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <GradientButton variant="secondary" label="Try again" onPress={() => void load(true)} />
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : null}

      {!error && notifications.length > 0
        ? notifications.map((n) => {
            const unread = !n.readAt;
            return (
              <View key={n.id} style={[styles.card, unread && styles.cardUnread]}>
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
        : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
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
    backgroundColor: colors.blueSoft,
    borderColor: '#B9DFE8',
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
