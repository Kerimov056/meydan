import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { Choice, FormField } from '@/src/components/forms';
import { AppScreen, Body, PrimaryButton, Title } from '@/src/components/ui';
import { colors, radii, spacing } from '@/src/theme';

const positions = ['Qapıçı', 'Müdafiəçi', 'Yarımmüdafiəçi', 'Hücumçu', 'Universal'];

export default function ProfileSetupScreen() {
  const { user, reloadUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [position, setPosition] = useState(user?.position ?? 'Universal');
  const [district, setDistrict] = useState(user?.district ?? 'Bakı');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.profile.update({ name, username, position, district });
      await reloadUser();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Profil saxlanılmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen contentStyle={styles.page}>
      <View style={styles.progressRow}><Text style={styles.step}>PROFİL · 1/1</Text><View style={styles.progress}><View style={styles.progressFill} /></View></View>
      <Title>Özünü meydana təqdim et</Title>
      <Body style={styles.intro}>Bu məlumatları sonradan profilindən dəyişə bilərsən.</Body>
      <View style={styles.avatar}><Ionicons name="person" size={31} color={colors.accent} /></View>
      <FormField label="Ad və soyad" value={name} onChangeText={setName} />
      <FormField label="Username" value={username} onChangeText={(value) => setUsername(value.replace(/\s/g, '').toLowerCase())} prefix="@" autoCapitalize="none" />
      <FormField label="Rayon" value={district} onChangeText={setDistrict} />
      <Text style={styles.label}>Əsas mövqe</Text>
      <View style={styles.positionGrid}>{positions.map((item) => <View key={item} style={styles.choiceWrap}><Choice label={item} active={position === item} onPress={() => setPosition(item)} /></View>)}</View>
      <View style={styles.privacyNote}><Ionicons name="lock-closed" size={18} color={colors.accent} /><Text style={styles.privacyText}>Telefon nömrən ictimai görünməyəcək.</Text></View>
      <PrimaryButton label={busy ? 'Saxlanılır...' : 'Profili tamamla'} disabled={!name.trim() || busy} onPress={save} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.xl },
  step: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  progress: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceLight },
  progressFill: { width: '100%', height: 4, borderRadius: 2, backgroundColor: colors.accent },
  intro: { marginTop: 10 },
  avatar: { width: 82, height: 82, borderRadius: 27, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: spacing.xl },
  label: { color: colors.textSoft, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  choiceWrap: { minWidth: '30%', flexGrow: 1 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.accentDark, marginBottom: spacing.xl },
  privacyText: { flex: 1, color: colors.textSoft, fontSize: 11, lineHeight: 16 },
});
