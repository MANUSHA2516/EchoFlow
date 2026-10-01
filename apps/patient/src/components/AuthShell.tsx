import { Text } from './AppText';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Globe } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { EcgWave } from './EcgWave';
import { config } from '../lib/config';

type Props = {
  badge: string;
  badgeTone?: 'mint' | 'teal' | 'amber' | 'green' | 'blue';
  unitLabel?: string;
  children: ReactNode;
  showBrand?: boolean;
  showFooter?: boolean;
  brandSubtitle?: string;
};

export function AuthShell({
  badge,
  badgeTone = 'mint',
  unitLabel = 'ECHOCARDIOGRAPHY UNIT',
  children,
  showBrand = true,
  showFooter = true,
  brandSubtitle,
}: Props) {
  const { width } = useWindowDimensions();
  const waveWidth = Math.min(width - 84, 300);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <View pointerEvents="none" style={styles.cornerTop} />
            <View pointerEvents="none" style={styles.cornerBottom} />
            <View style={styles.panelContent}>
              <View style={styles.topRow}>
                <StatusBadge label={badge} tone={badgeTone} />
                <Text style={styles.unit}>{unitLabel}</Text>
              </View>

              {showBrand ? (
                <View style={styles.brand}>
                  <View style={styles.logo}>
                    <Activity color={colors.tealDeep} size={27} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.hospital}>{config.hospitalName}</Text>
                  <Text style={styles.portal}>
                    {(brandSubtitle ?? config.unitLabel).toUpperCase()}
                  </Text>
                  <View style={styles.wave}>
                    <EcgWave width={waveWidth} height={36} />
                  </View>
                </View>
              ) : null}

              {children}

              {showFooter ? (
                <View style={styles.footer}>
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.blue }]} />
                      <Text style={styles.legendText}>Private</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.cyan }]} />
                      <Text style={styles.legendText}>Secure</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: colors.green }]} />
                      <Text style={styles.legendText}>Patient care</Text>
                    </View>
                  </View>
                  <View style={styles.lang}>
                    <Globe size={14} color={colors.slate} />
                    <Text style={styles.langText}>EN</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EEF5F7',
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#E7EEF1',
    backgroundColor: colors.white,
    shadowColor: '#18364D',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  panelContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 22,
    zIndex: 1,
  },
  cornerTop: {
    position: 'absolute',
    width: 142,
    height: 142,
    borderRadius: 80,
    top: -82,
    right: -55,
    backgroundColor: '#E8F2F7',
  },
  cornerBottom: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 80,
    bottom: -85,
    left: -75,
    backgroundColor: '#E8F6F4',
  },
  topRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  unit: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: colors.slateSoft,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueSoft,
    borderColor: colors.border,
    borderWidth: 2,
  },
  hospital: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  portal: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.slateSoft,
  },
  wave: {
    marginTop: 2,
    alignSelf: 'center',
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.slate,
    fontWeight: '600',
  },
  lang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate,
  },
});
