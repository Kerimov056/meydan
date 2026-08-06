import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { FormField } from '@/src/components/forms';
import { AppScreen, IconButton, PrimaryButton, Title } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

export default function NewStadiumScreen() {
  const [form, setForm] = useState({ name: '', district: '', address: '', contact_name: '', contact_phone: '', latitude: '40.4093', longitude: '49.8671', verification_radius: '100' });
  const [busy, setBusy] = useState(false);
  const field = (key: keyof typeof form) => ({ value: form[key], onChangeText: (value: string) => setForm((current) => ({ ...current, [key]: value })) });
  const submit = async () => { setBusy(true); try { const venue = await api.stadiums.create({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), verification_radius: Number(form.verification_radius) }); Alert.alert('Stadion yaradıldı', 'İndi şəkil və format əlavə edə bilərsən.', [{ text: 'Davam et', onPress: () => router.replace(`/admin/stadiums/${venue.id}`) }]); } catch (error) { Alert.alert('Yaradılmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.'); } finally { setBusy(false); } };
  return <AppScreen><View style={styles.header}><IconButton icon="close" onPress={() => router.back()} /><Text style={styles.headerText}>SUPER ADMIN</Text><View style={{ width: 42 }} /></View><Title>Stadion əlavə et</Title><View style={styles.form}><FormField label="Ad" {...field('name')} /><FormField label="Rayon" {...field('district')} /><FormField label="Ünvan" {...field('address')} /><FormField label="Əlaqədar şəxs" {...field('contact_name')} /><FormField label="Telefon" {...field('contact_phone')} keyboardType="phone-pad" /><FormField label="Latitude" {...field('latitude')} keyboardType="decimal-pad" /><FormField label="Longitude" {...field('longitude')} keyboardType="decimal-pad" /><FormField label="Verification radius" {...field('verification_radius')} keyboardType="number-pad" /></View><PrimaryButton label={busy ? 'Yaradılır...' : 'Stadion yarat'} icon="business" disabled={busy || !form.name || !form.district} onPress={submit} /></AppScreen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, form: { marginTop: spacing.xl } });
