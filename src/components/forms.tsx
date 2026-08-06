import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { PrimaryButton } from '@/src/components/ui';
import { colors, radii, spacing } from '@/src/theme';

export function FormField({ label, prefix, ...props }: TextInputProps & { label: string; prefix?: string }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, props.multiline && styles.multiline, props.style]} />
      </View>
    </View>
  );
}

export function LoadingView({ label = 'Yüklənir...' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorCard}>
      <Ionicons name="cloud-offline-outline" size={26} color={colors.danger} />
      <Text style={styles.errorTitle}>Məlumat alınmadı</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <PrimaryButton label="Yenidən yoxla" secondary icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

export function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PullToRefresh({ refreshing, onRefresh, children }: { refreshing: boolean; onRefresh: () => void; children: React.ReactNode }) {
  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fieldBlock: { marginBottom: spacing.md },
  label: { color: colors.textSoft, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  inputWrap: { minHeight: 54, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  prefix: { color: colors.accent, fontSize: 15, fontWeight: '800' },
  input: { flex: 1, minHeight: 52, color: colors.text, fontSize: 14, fontWeight: '700', paddingHorizontal: 6 },
  multiline: { minHeight: 100, paddingTop: 14, textAlignVertical: 'top' },
  state: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 12 },
  stateText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  errorCard: { minHeight: 220, borderRadius: radii.lg, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#4A2323', justifyContent: 'center', alignItems: 'center', gap: 10 },
  errorTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  errorText: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginBottom: 8 },
  choice: { flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  choiceActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  choiceText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  choiceTextActive: { color: colors.background },
});
