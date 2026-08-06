import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, IconButton, Pill, PrimaryButton } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function StadiumDetailsScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const state = useAsyncData(() => api.stadiums.show(id), [id]);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Stadion tapılmadı.'} onRetry={state.reload} /></AppScreen>;
  const venue = state.data;
  const cover = venue.photos.find((photo) => photo.is_cover) ?? venue.photos[0];
  const openMap = () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`);
  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerText}>STADIUM</Text><IconButton icon="refresh" onPress={state.reload} /></View>
    {cover ? <Image source={{ uri: cover.image_url }} style={styles.cover} /> : <View style={styles.placeholder}><Ionicons name="football" size={42} color={colors.accent} /></View>}
    <View style={styles.heading}><View style={{ flex: 1 }}><Text style={styles.name}>{venue.name}</Text><Text style={styles.address}>{venue.district} · {venue.address}</Text></View>{venue.isVerified ? <Pill tone="accent" icon="shield-checkmark">Verified</Pill> : null}</View>
    <View style={styles.formats}>{venue.formats.map((format) => <Pill key={format} tone="blue">{format}</Pill>)}</View>
    <Card style={styles.info}><Info icon="navigate-outline" label="Koordinat" value={`${venue.latitude}, ${venue.longitude}`} /><Info icon="radio-outline" label="GPS radius" value={`${venue.verificationRadius} metr`} /><Info icon="person-outline" label="Əlaqə" value={venue.contactName ?? '—'} /><Info icon="call-outline" label="Telefon" value={venue.contactPhone ?? '—'} /></Card>
    <PrimaryButton label="Xəritədə aç" icon="navigate" onPress={openMap} />
    {venue.contactPhone ? <View style={styles.call}><PrimaryButton label="Stadiona zəng et" secondary icon="call" onPress={() => Linking.openURL(`tel:${venue.contactPhone}`)} /></View> : null}
    {user?.role === 'super_admin' ? <View style={styles.admin}><PrimaryButton label="Stadionu idarə et" secondary icon="settings-outline" onPress={() => router.push(`/admin/stadiums/${venue.id}`)} /></View> : null}
  </AppScreen>;
}

function Info({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) { return <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={icon} size={18} color={colors.accent} /></View><View><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>; }
const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, headerText: { color: colors.accent, fontSize: 10, fontWeight: '900' }, cover: { width: '100%', height: 220, borderRadius: radii.xl, backgroundColor: colors.surface }, placeholder: { width: '100%', height: 220, borderRadius: radii.xl, backgroundColor: '#102E20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#315A40' }, heading: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg }, name: { color: colors.text, fontSize: 24, fontWeight: '900' }, address: { color: colors.muted, fontSize: 10, marginTop: 5 }, formats: { flexDirection: 'row', gap: 7, marginVertical: spacing.md }, info: { gap: spacing.md, marginBottom: spacing.md }, infoRow: { flexDirection: 'row', alignItems: 'center' }, infoIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, infoLabel: { color: colors.muted, fontSize: 9 }, infoValue: { color: colors.text, fontSize: 11, fontWeight: '800', marginTop: 3 }, call: { marginTop: spacing.sm }, admin: { marginTop: spacing.sm } });
