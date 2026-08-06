import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, IconButton, Pill, PrimaryButton, SegmentedControl } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function MatchRosterScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const state = useAsyncData(async () => {
    const [match, rosters, mine] = await Promise.all([api.matches.show(id), api.rosters.list(id), api.teams.mine()]);
    const teams = await Promise.all(rosters.map((roster) => api.teams.show(roster.team.numericId)));
    return { match, rosters, mine, teams };
  }, [id]);
  const [teamChoice, setTeamChoice] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const manageable = useMemo(() => {
    if (!state.data) return [];
    const ids = new Set(state.data.mine.map((team) => team.numericId));
    return state.data.rosters.filter((roster) => ids.has(roster.team.numericId));
  }, [state.data]);
  const selectedRoster = manageable.find((item) => String(item.team.numericId) === teamChoice) ?? manageable[0];
  const selectedTeam = state.data?.teams.find((team) => team.numericId === selectedRoster?.team.numericId);

  useEffect(() => {
    if (selectedRoster) setSelected(selectedRoster.players.map((player) => player.user_id));
  }, [selectedRoster?.id]);

  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Roster alınmadı.'} onRetry={state.reload} /></AppScreen>;
  const loaded = state.data;

  const toggle = (userId: number) => setSelected((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
  const action = async (kind: 'save' | 'submit' | 'reopen') => {
    if (!selectedRoster) return;
    setBusy(true);
    try {
      if (kind === 'save') await api.rosters.update(loaded.match.numericId, selectedRoster.team.numericId, selected);
      if (kind === 'submit') await api.rosters.submit(loaded.match.numericId, selectedRoster.team.numericId);
      if (kind === 'reopen') await api.rosters.reopen(loaded.match.numericId, selectedRoster.team.numericId);
      await state.reload();
      Alert.alert('Hazırdır', kind === 'save' ? 'Roster draft saxlanıldı.' : kind === 'submit' ? 'Roster submit edildi.' : 'Roster yenidən açıldı.');
    } catch (error) {
      Alert.alert('Əməliyyat alınmadı', error instanceof Error ? error.message : 'Yenidən yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerTitle}>MATCH ROSTER · {loaded.match.format}</Text><IconButton icon="refresh" onPress={state.reload} /></View>
    <Text style={styles.title}>Komanda heyətləri</Text><Text style={styles.subtitle}>Hər komanda minimum {loaded.match.format === '5v5' ? 5 : 6} aktiv oyunçu seçib submit etməlidir.</Text>
    <View style={styles.rosterCards}>{loaded.rosters.map((roster) => <Card key={roster.id} style={styles.summary}><TeamAvatar team={roster.team} size={44} /><View style={styles.summaryMain}><Text style={styles.teamName}>{roster.team.name}</Text><Text style={styles.count}>{roster.players_count}/{roster.required_players} minimum · {roster.status}</Text></View><Pill tone={roster.status === 'submitted' ? 'accent' : 'warning'}>{roster.status}</Pill></Card>)}</View>
    {!manageable.length ? <Card style={styles.notice}><Text style={styles.noticeText}>Sən bu oyundakı komandalardan heç birinin üzvü deyilsən. Roster-ləri yalnız görə bilərsən.</Text></Card> : <>
      {manageable.length > 1 ? <View style={styles.segment}><SegmentedControl options={manageable.map((item) => String(item.team.numericId))} value={String(selectedRoster?.team.numericId)} onChange={setTeamChoice} /></View> : null}
      <Text style={styles.sectionTitle}>{selectedRoster?.team.name} seçimi</Text>
      <View style={styles.players}>{selectedTeam?.members.filter((member) => member.status === 'active').map((member) => { const active = selected.includes(member.user_id); return <Pressable disabled={selectedRoster?.status === 'submitted'} key={member.id} onPress={() => toggle(member.user_id)} style={[styles.player, active && styles.playerActive]}><View style={[styles.check, active && styles.checkActive]}>{active ? <Ionicons name="checkmark" size={14} color={colors.background} /> : null}</View><View style={styles.playerMain}><Text style={styles.playerName}>{member.user.name}</Text><Text style={styles.playerMeta}>{member.role}{member.jersey_number ? ` · #${member.jersey_number}` : ''}</Text></View></Pressable>; })}</View>
      {!selectedTeam?.members.length ? <Card style={styles.notice}><Text style={styles.noticeText}>Team detail response-u `members` əlaqəsini qaytarmır. Backend `TeamController@show` daxilində members.user eager-load edilməlidir.</Text></Card> : null}
      <View style={styles.selectedCount}><Text style={styles.selectedText}>Seçilib: {selected.length} / maksimum {selectedRoster?.maximum_players}</Text></View>
      {selectedRoster?.status === 'submitted' ? <PrimaryButton label="Roster-i yenidən aç" secondary icon="lock-open-outline" disabled={busy} onPress={() => action('reopen')} /> : <View style={styles.actions}><View style={styles.flex}><PrimaryButton label="Draft saxla" secondary icon="save-outline" disabled={busy || !selected.length} onPress={() => action('save')} /></View><View style={styles.flex}><PrimaryButton label="Submit et" icon="lock-closed" disabled={busy || selected.length < (selectedRoster?.required_players ?? 99)} onPress={() => action('submit')} /></View></View>}
    </>}
  </AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }, headerTitle: { color: colors.accent, fontSize: 9, fontWeight: '900' }, title: { color: colors.text, fontSize: 26, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 }, rosterCards: { gap: 8, marginTop: spacing.lg }, summary: { flexDirection: 'row', alignItems: 'center' }, summaryMain: { flex: 1, marginLeft: 10 }, teamName: { color: colors.text, fontSize: 12, fontWeight: '800' }, count: { color: colors.muted, fontSize: 9, marginTop: 4 }, segment: { marginTop: spacing.lg }, sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.sm }, players: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, player: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }, playerActive: { backgroundColor: '#102A1E' }, check: { width: 26, height: 26, borderRadius: 9, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checkActive: { backgroundColor: colors.accent, borderColor: colors.accent }, playerMain: { flex: 1, marginLeft: 10 }, playerName: { color: colors.text, fontSize: 12, fontWeight: '800' }, playerMeta: { color: colors.muted, fontSize: 9, marginTop: 3 }, selectedCount: { paddingVertical: spacing.md, alignItems: 'center' }, selectedText: { color: colors.textSoft, fontSize: 11, fontWeight: '800' }, actions: { flexDirection: 'row', gap: 8 }, flex: { flex: 1 }, notice: { marginTop: spacing.md, backgroundColor: '#2B2514' }, noticeText: { color: colors.warning, fontSize: 10, lineHeight: 16 } });
