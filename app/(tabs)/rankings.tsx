import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, EmptyState, Pill, SegmentedControl, Title } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function RankingsScreen() {
  const [format, setFormat] = useState('5v5');
  const state = useAsyncData(() => api.teams.list(), []);
  const sorted = useMemo(() => [...(state.data ?? [])].sort((a, b) => format === '5v5' ? b.rating5v5 - a.rating5v5 : b.rating6v6 - a.rating6v6), [format, state.data]);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error) return <AppScreen><ErrorView message={state.error} onRetry={state.reload} /></AppScreen>;
  return <AppScreen><View style={styles.headingRow}><View><Text style={styles.eyebrow}>BAKI · RANKED</Text><Title>Reytinq</Title></View><Pill tone="accent" icon="shield-checkmark">Verified only</Pill></View><View style={styles.segment}><SegmentedControl options={['5v5', '6v6']} value={format} onChange={setFormat} /></View>{sorted.length ? <View style={styles.list}>{sorted.map((team, index) => <Pressable key={team.id} onPress={() => router.push(`/team/${team.id}`)} style={styles.row}><Text style={[styles.place, index === 0 && styles.first]}>#{index + 1}</Text><TeamAvatar team={team} size={40} /><View style={styles.main}><Text style={styles.name}>{team.name}</Text><Text style={styles.meta}>{team.district} · {team.wins + team.draws + team.losses} oyun</Text></View><Text style={styles.rating}>{format === '5v5' ? team.rating5v5 : team.rating6v6}</Text><Ionicons name="chevron-forward" size={15} color={colors.muted} /></Pressable>)}</View> : <EmptyState icon="podium-outline" title="Reytinq boşdur" body="Komandalar və rating məlumatı gəldikdə burada sıralanacaq." />}</AppScreen>;
}

const styles = StyleSheet.create({ headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 6 }, segment: { marginVertical: spacing.lg }, list: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, row: { minHeight: 70, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, place: { width: 32, color: colors.muted, fontWeight: '900' }, first: { color: colors.accent }, main: { flex: 1 }, name: { color: colors.text, fontSize: 12, fontWeight: '800' }, meta: { color: colors.muted, fontSize: 9, marginTop: 3 }, rating: { color: colors.text, fontSize: 14, fontWeight: '900' } });
