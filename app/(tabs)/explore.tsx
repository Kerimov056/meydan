import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { api } from '@/src/api/endpoints';
import { ChallengeCard, TeamCard } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, EmptyState, Pill, SegmentedControl, Title } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function ExploreScreen() {
  const [tab, setTab] = useState('Challenges');
  const [format, setFormat] = useState('5v5');
  const state = useAsyncData(async () => {
    const [challenges, teams, stadiums] = await Promise.all([api.matches.open(), api.teams.list(), api.stadiums.list()]);
    return { challenges, teams, stadiums };
  }, []);

  if (state.loading) return <AppScreen><LoadingView label="Bakı meydanı yüklənir..." /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Kəşf məlumatları alınmadı.'} onRetry={state.reload} /></AppScreen>;
  const formatValue = format as '5v5' | '6v6';
  const challenges = state.data.challenges.filter((item) => item.format === formatValue);
  const teams = state.data.teams.filter((item) => item.formats.includes(formatValue));
  const stadiums = state.data.stadiums.filter((item) => item.formats.includes(formatValue));

  return (
    <AppScreen>
      <Title>Kəşf et</Title>
      <Text style={styles.subtitle}>Komandaları, open challenge-ləri və stadionları tap.</Text>
      <View style={styles.segment}><SegmentedControl options={['Challenges', 'Komandalar', 'Stadionlar']} value={tab} onChange={setTab} /></View>
      <View style={styles.format}><SegmentedControl options={['5v5', '6v6']} value={format} onChange={setFormat} /></View>
      {tab === 'Challenges' ? (challenges.length ? challenges.map((item) => <ChallengeCard key={item.id} challenge={item} />) : <EmptyState icon="search-outline" title="Open challenge yoxdur" body="Bu format üçün ilk challenge-i sən yarat." />) : null}
      {tab === 'Komandalar' ? (teams.length ? teams.map((team) => <TeamCard key={team.id} team={team} format={formatValue} />) : <EmptyState icon="people-outline" title="Komanda yoxdur" body="Bu formatda aktiv komanda tapılmadı." />) : null}
      {tab === 'Stadionlar' ? (stadiums.length ? stadiums.map((venue) => <Pressable key={venue.id} onPress={() => router.push(`/stadium/${venue.id}`)}><Card style={styles.venue}><View style={styles.venueIcon}><Ionicons name="location" size={20} color={colors.accent} /></View><View style={styles.venueMain}><Text style={styles.venueName}>{venue.name}</Text><Text style={styles.venueMeta}>{venue.district} · {venue.address ?? 'Ünvan əlavə edilməyib'}</Text></View><Pill tone="accent">{venue.formats.join(' · ')}</Pill></Card></Pressable>) : <EmptyState icon="location-outline" title="Stadion yoxdur" body="Bu format üçün aktiv stadion tapılmadı." />) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 7 }, segment: { marginTop: spacing.lg }, format: { marginVertical: spacing.md },
  venue: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }, venueIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' }, venueMain: { flex: 1, marginLeft: 11 }, venueName: { color: colors.text, fontSize: 13, fontWeight: '800' }, venueMeta: { color: colors.muted, fontSize: 9, marginTop: 4 },
});
