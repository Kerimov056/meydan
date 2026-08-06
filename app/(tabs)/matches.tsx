import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { MatchCard } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, EmptyState, PrimaryButton, SegmentedControl, Title } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { spacing } from '@/src/theme';

export default function MatchesScreen() {
  const [tab, setTab] = useState('Aktiv');
  const state = useAsyncData(() => api.matches.mine(), []);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Oyunlar alınmadı.'} onRetry={state.reload} /></AppScreen>;
  const active = state.data.filter((match) => !['verified', 'completed', 'cancelled', 'rejected'].includes(match.status));
  const history = state.data.filter((match) => ['verified', 'completed', 'cancelled', 'rejected'].includes(match.status));
  const list = tab === 'Aktiv' ? active : history;
  return <AppScreen><Title>Oyunlar</Title><View style={styles.segment}><SegmentedControl options={['Aktiv', 'Tarixçə']} value={tab} onChange={setTab} /></View>{list.length ? list.map((match) => <MatchCard key={match.id} match={match} />) : <EmptyState icon="football-outline" title="Oyun tapılmadı" body={tab === 'Aktiv' ? 'Yeni ranked challenge yarat.' : 'Tamamlanmış oyunlar burada görünəcək.'} />}<View style={styles.button}><PrimaryButton label="Challenge yarat" icon="add" onPress={() => router.push('/challenge/new')} /></View></AppScreen>;
}

const styles = StyleSheet.create({ segment: { marginTop: spacing.lg, marginBottom: spacing.md }, button: { marginTop: spacing.md } });
