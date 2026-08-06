import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { FormField, ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, IconButton, PrimaryButton, SegmentedControl, Title } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';
import { MatchFormat, StadiumFormat } from '@/src/types';

export default function ManageStadiumScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const state = useAsyncData(() => api.stadiums.show(id), [id]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [format, setFormat] = useState('5v5');
  const [length, setLength] = useState('40');
  const [width, setWidth] = useState('20');
  const [busy, setBusy] = useState(false);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Stadion tapılmadı.'} onRetry={state.reload} /></AppScreen>;
  const venue = state.data;
  const rawFormats = (((venue.raw as any)?.formats ?? []) as StadiumFormat[]);
  const run = async (operation: () => Promise<unknown>, success: string) => { setBusy(true); try { await operation(); await state.reload(); Alert.alert('Hazırdır', success); } catch (error) { Alert.alert('Əməliyyat alınmadı', error instanceof Error ? error.message : 'Yenidən yoxlayın.'); } finally { setBusy(false); } };
  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerText}>SUPER ADMIN</Text><IconButton icon="refresh" onPress={state.reload} /></View><Title>{venue.name}</Title>
    <Text style={styles.section}>Şəkillər</Text><Card>{venue.photos.map((photo) => <View key={photo.id} style={styles.item}><View style={styles.icon}><Ionicons name="image-outline" size={18} color={colors.accent} /></View><Text numberOfLines={1} style={styles.itemText}>{photo.image_url}</Text><Pressable onPress={() => run(() => api.stadiums.deletePhoto(photo.id), 'Şəkil silindi.')}><Ionicons name="trash-outline" size={19} color={colors.danger} /></Pressable></View>)}<FormField label="Yeni image URL" value={photoUrl} onChangeText={setPhotoUrl} autoCapitalize="none" /><PrimaryButton label="Şəkil əlavə et" secondary icon="image-outline" disabled={busy || !photoUrl} onPress={() => run(() => api.stadiums.addPhoto(venue.numericId, { image_url: photoUrl, is_cover: !venue.photos.length, sort_order: venue.photos.length }), 'Şəkil əlavə edildi.')} /></Card>
    <Text style={styles.section}>Formatlar</Text><Card>{rawFormats.map((item) => <View key={item.id} style={styles.item}><View style={styles.icon}><Ionicons name="football-outline" size={18} color={colors.accent} /></View><Text style={styles.itemText}>{item.format} · {item.length}m × {item.width}m</Text><Pressable onPress={() => run(() => api.stadiums.deleteFormat(item.id), 'Format silindi.')}><Ionicons name="trash-outline" size={19} color={colors.danger} /></Pressable></View>)}<SegmentedControl options={['5v5', '6v6']} value={format} onChange={setFormat} /><View style={styles.dimensions}><View style={{ flex: 1 }}><FormField label="Uzunluq" value={length} onChangeText={setLength} keyboardType="decimal-pad" /></View><View style={{ flex: 1 }}><FormField label="En" value={width} onChangeText={setWidth} keyboardType="decimal-pad" /></View></View><PrimaryButton label="Format əlavə et" secondary icon="add" disabled={busy} onPress={() => run(() => api.stadiums.addFormat(venue.numericId, { format: format as MatchFormat, length: Number(length), width: Number(width) }), 'Format əlavə edildi.')} /></Card>
  </AppScreen>;
}
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, section: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.sm }, item: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.border }, icon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' }, itemText: { flex: 1, color: colors.textSoft, fontSize: 10 }, dimensions: { flexDirection: 'row', gap: 8, marginTop: spacing.md } });
