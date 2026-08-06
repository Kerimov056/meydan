import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { Choice, FormField } from '@/src/components/forms';
import { AppScreen, IconButton, PrimaryButton, Title } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { MatchFormat } from '@/src/types';

export default function CreateTeamScreen() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [shortName, setShortName] = useState('');
  const [district, setDistrict] = useState('Bakı');
  const [formats, setFormats] = useState<MatchFormat[]>(['5v5']);
  const [busy, setBusy] = useState(false);
  const toggle = (format: MatchFormat) => setFormats((current) => current.includes(format) ? current.filter((item) => item !== format) : [...current, format]);
  const submit = async () => {
    setBusy(true);
    try {
      const team = await api.teams.create({ name, handle: handle.replace(/^@/, ''), short_name: shortName || undefined, district, formats });
      Alert.alert('Komanda yaradıldı', `${team.name} artıq Meydan-dadır.`, [{ text: 'Profilə bax', onPress: () => router.replace(`/team/${team.id}`) }]);
    } catch (error) { Alert.alert('Yaradılmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.'); } finally { setBusy(false); }
  };
  return <AppScreen><View style={styles.header}><IconButton icon="close" onPress={() => router.back()} /><Text style={styles.headerText}>NEW TEAM</Text><View style={{ width: 42 }} /></View><Title>Komandanı yarat</Title><Text style={styles.subtitle}>Kapitan olaraq ilk roster-i qur və challenge-lərə başla.</Text><View style={styles.form}><FormField label="Komanda adı" value={name} onChangeText={setName} /><FormField label="Handle" prefix="@" value={handle} onChangeText={(value) => setHandle(value.replace(/\s/g, '').toLowerCase())} autoCapitalize="none" /><FormField label="Qısa ad" value={shortName} onChangeText={(value) => setShortName(value.toUpperCase().slice(0, 5))} placeholder="BL" /><FormField label="Rayon" value={district} onChangeText={setDistrict} /><Text style={styles.label}>Formatlar</Text><View style={styles.options}><Choice label="5v5" active={formats.includes('5v5')} onPress={() => toggle('5v5')} /><Choice label="6v6" active={formats.includes('6v6')} onPress={() => toggle('6v6')} /></View></View><PrimaryButton label={busy ? 'Yaradılır...' : 'Komandanı yarat'} icon="people" disabled={busy || !name || !handle || !formats.length} onPress={submit} /></AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 7 }, form: { marginTop: spacing.xl }, label: { color: colors.textSoft, fontSize: 12, fontWeight: '700', marginBottom: 8 }, options: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl } });
