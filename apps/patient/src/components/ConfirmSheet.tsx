import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from './AppText';
import { GradientButton } from './GradientButton';
import { colors } from '../theme/colors';
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onCancel();
      }}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Dismiss confirmation"
          accessibilityRole="button"
          disabled={busy}
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['bottom']} style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <GradientButton
            label={confirmLabel}
            variant="danger"
            loading={busy}
            onPress={onConfirm}
          />
          <GradientButton
            label="Keep my place"
            variant="secondary"
            disabled={busy}
            onPress={onCancel}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.white,
    padding: 24,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800' },
  message: { color: colors.slate, marginBottom: 8 },
});
