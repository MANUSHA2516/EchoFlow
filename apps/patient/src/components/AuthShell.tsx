import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <StatusBadge label={badge} tone={badgeTone} />
            <Text style={styles.unit}>{unitLabel}</Text>
          </View>

          {showBrand ? (
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Activity color={colors.tealDeep} size={26} strokeWidth={2.4} />
              </View>
              <Text style={styles.hospital}>{config.hospitalName}</Text>
              <Text style={styles.portal}>
                {(brandSubtitle ?? config.unitLabel).toUpperCase()}
              </Text>
              <View style={styles.wave}>
                <EcgWave width={300} height={40} />
              </View>
            </View>
          ) : null}

          {children}

          {showFooter ? (
            <View style={styles.footer}>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: colors.blue }]} />
                  <Text style={styles.legendText}>HR</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: colors.amber }]} />
                  <Text style={styles.legendText}>SpO2</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: colors.green }]} />
                  <Text style={styles.legendText}>Verified</Text>
                </View>
              </View>
              <View style={styles.lang}>
                <Globe size={14} color={colors.slate} />
                <Text style={styles.langText}>EN</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  blobTop: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#DBEAFE',
    opacity: 0.75,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -70,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#CCFBF1',
    opacity: 0.6,
  },
  topRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  unit: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: colors.slateSoft,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFEFF',
    borderWidth: 2,
    borderColor: '#99F6E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospital: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  portal: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.slateSoft,
  },
  wave: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
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
    fontSize: 11,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate,
  },
});
