import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { FormField } from '@/src/components/forms';
import { AppScreen, IconButton, PrimaryButton, Title } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

export default function JoinTeamScreen() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const join = async () => { setBusy(true); try { await api.teams.joinByCode(code.trim().toUpperCase()); Alert.alert('Hazırdır', 'Komandaya qoşulma əməliyyatı tamamlandı.', [{ text: 'Profilə qayıt', onPress: () => router.back() }]); } catch (error) { Alert.alert('Qoşulmaq alınmadı', error instanceof Error ? error.message : 'Kodu yoxlayın.'); } finally { setBusy(false); } };
  return <AppScreen><View style={styles.header}><IconButton icon="close" onPress={() => router.back()} /><Text style={styles.headerText}>JOIN TEAM</Text><View style={{ width: 42 }} /></View><Title>Dəvət kodu</Title><Text style={styles.subtitle}>Kapitanın paylaşdığı invite code-u daxil et.</Text><View style={styles.form}><FormField label="Invite code" value={code} onChangeText={(value) => setCode(value.toUpperCase().replace(/\s/g, ''))} autoCapitalize="characters" placeholder="ABC123" /></View><PrimaryButton label={busy ? 'Qoşulur...' : 'Komandaya qoşul'} icon="enter-outline" disabled={busy || code.length < 4} onPress={join} /></AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 7 }, form: { marginTop: spacing.xl } });
