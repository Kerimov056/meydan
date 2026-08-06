import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, Card, IconButton, Pill, PrimaryButton, SegmentedControl } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function MatchDetailsScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const state = useAsyncData(async () => {
    const [match, mine] = await Promise.all([api.matches.show(id), api.teams.mine()]);
    return { match, mine };
  }, [id]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [busy, setBusy] = useState(false);

  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Oyun tapılmadı.'} onRetry={state.reload} /></AppScreen>;
  const { match, mine } = state.data;
  const eligible = mine.filter((team) => team.numericId !== match.home.numericId && (!match.away || team.numericId === match.away.numericId));
  const teamId = Number(selectedTeam || eligible[0]?.id || 0);
  const ownsHome = mine.some((team) => team.numericId === match.home.numericId);
  const canAccept = match.status === 'open' || (match.status === 'pending' && eligible.some((team) => team.numericId === match.away?.numericId));
  const canReject = match.challengeType === 'direct' && match.status === 'pending' && eligible.length > 0;
  const rosterAvailable = ['accepted', 'rosters_ready'].includes(match.status);

  const run = async (action: 'accept' | 'reject' | 'cancel') => {
    setBusy(true);
    try {
      if (action === 'accept') await api.matches.accept(match.numericId, teamId);
      if (action === 'reject') await api.matches.reject(match.numericId, teamId);
      if (action === 'cancel') await api.matches.cancel(match.numericId, 'Mobil tətbiqdən ləğv edildi.');
      await state.reload();
      Alert.alert('Hazırdır', action === 'accept' ? 'Challenge qəbul edildi.' : action === 'reject' ? 'Challenge rədd edildi.' : 'Oyun ləğv edildi.');
    } catch (error) {
      Alert.alert('Əməliyyat alınmadı', error instanceof Error ? error.message : 'Yenidən yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerTitle}>MATCH DETAILS</Text><IconButton icon="refresh" onPress={state.reload} /></View>
    <Card style={styles.matchHero}><View style={styles.heroTop}><Pill tone={match.status === 'cancelled' ? 'warning' : 'accent'} icon="flash">{match.matchType}</Pill><Text style={styles.format}>{match.format} · {match.status}</Text></View><View style={styles.teamsRow}><View style={styles.teamSide}><TeamAvatar team={match.home} size={66} /><Text style={styles.teamName}>{match.home.name}</Text></View><View style={styles.center}><Text style={styles.date}>{match.dateLabel}</Text><Text style={styles.time}>{match.time}</Text><Text style={styles.rankLabel}>{match.away ? 'VS' : 'OPEN'}</Text></View><View style={[styles.teamSide, styles.right]}>{match.away ? <TeamAvatar team={match.away} size={66} /> : <View style={styles.openIcon}><Ionicons name="search" size={24} color={colors.accent} /></View>}<Text style={[styles.teamName, styles.textRight]}>{match.away?.name ?? 'Rəqib gözlənilir'}</Text></View></View></Card>
    <Pressable onPress={() => router.push(`/stadium/${match.venue.id}`)}><Card style={styles.venue}><View style={styles.venueIcon}><Ionicons name="location" size={20} color={colors.accent} /></View><View style={styles.venueMain}><Text style={styles.venueName}>{match.venue.name}</Text><Text style={styles.venueMeta}>{match.venue.district} · radius {match.venue.verificationRadius}m</Text></View><Ionicons name="chevron-forward" size={19} color={colors.muted} /></Card></Pressable>
    {eligible.length > 1 && canAccept ? <View style={styles.selector}><Text style={styles.label}>Hansı komanda ilə?</Text><SegmentedControl options={eligible.map((team) => team.id)} value={String(teamId)} onChange={setSelectedTeam} /><Text style={styles.selectionName}>{eligible.find((team) => team.numericId === teamId)?.name}</Text></View> : null}
    {canAccept && teamId ? <View style={styles.actions}><View style={styles.flex}><PrimaryButton label={busy ? 'Gözləyin...' : 'Qəbul et'} icon="checkmark" disabled={busy} onPress={() => run('accept')} /></View>{canReject ? <View style={styles.flex}><PrimaryButton label="Rədd et" secondary icon="close" disabled={busy} onPress={() => run('reject')} /></View> : null}</View> : null}
    {rosterAvailable ? <View style={styles.rosterButton}><PrimaryButton label="Match roster-ləri" icon="people" onPress={() => router.push(`/match/${match.id}/roster`)} /></View> : null}
    {ownsHome && ['open', 'pending', 'accepted', 'rosters_ready'].includes(match.status) ? <Pressable disabled={busy} onPress={() => Alert.alert('Oyunu ləğv et?', 'Bu əməliyyat match statusunu cancelled edəcək.', [{ text: 'Xeyr' }, { text: 'Ləğv et', style: 'destructive', onPress: () => run('cancel') }])} style={styles.cancel}><Text style={styles.cancelText}>Oyunu ləğv et</Text></Pressable> : null}
    <Text style={styles.sectionTitle}>Oyun vəziyyəti</Text><Card><Step done title="Challenge" body={match.challengeType === 'open' ? 'Open challenge yaradıldı' : 'Birbaşa challenge göndərildi'} /><Step done={['accepted', 'rosters_ready'].includes(match.status)} title="Qəbul" body="Rəqib komandanın təsdiqi" /><Step done={match.status === 'rosters_ready'} title="Roster" body="Hər iki komandanın roster submit-i" last /></Card>
    {match.notes ? <Card style={styles.notes}><Text style={styles.notesLabel}>QEYD</Text><Text style={styles.notesText}>{match.notes}</Text></Card> : null}
  </AppScreen>;
}

function Step({ title, body, done, last }: { title: string; body: string; done?: boolean; last?: boolean }) { return <View style={styles.step}><View style={styles.rail}><View style={[styles.stepIcon, done && styles.done]}><Ionicons name={done ? 'checkmark' : 'ellipse-outline'} size={14} color={done ? colors.background : colors.muted} /></View>{!last ? <View style={[styles.line, done && styles.lineDone]} /> : null}</View><View style={styles.stepMain}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepBody}>{body}</Text></View></View>; }

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, headerTitle: { color: colors.textSoft, fontSize: 10, fontWeight: '800' }, matchHero: { backgroundColor: '#102A1E', borderColor: '#315A40' }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, format: { color: colors.muted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }, teamsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl }, teamSide: { flex: 1, alignItems: 'flex-start', gap: 10 }, right: { alignItems: 'flex-end' }, teamName: { color: colors.text, fontSize: 12, fontWeight: '800', maxWidth: 105 }, textRight: { textAlign: 'right' }, center: { width: 88, alignItems: 'center' }, date: { color: colors.textSoft, fontSize: 10 }, time: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 3 }, rankLabel: { color: colors.accent, fontSize: 9, fontWeight: '900', marginTop: 4 }, openIcon: { width: 66, height: 66, borderRadius: 22, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' }, venue: { flexDirection: 'row', alignItems: 'center', marginTop: 10 }, venueIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' }, venueMain: { flex: 1, marginLeft: 11 }, venueName: { color: colors.text, fontSize: 12, fontWeight: '800' }, venueMeta: { color: colors.muted, fontSize: 9, marginTop: 4 }, selector: { marginTop: spacing.lg }, label: { color: colors.textSoft, fontSize: 11, fontWeight: '800', marginBottom: 8 }, selectionName: { color: colors.muted, fontSize: 10, marginTop: 6 }, actions: { flexDirection: 'row', gap: 8, marginTop: spacing.lg }, flex: { flex: 1 }, rosterButton: { marginTop: spacing.lg }, cancel: { marginTop: spacing.sm, padding: 14, alignItems: 'center' }, cancelText: { color: colors.danger, fontSize: 12, fontWeight: '800' }, sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.sm }, step: { minHeight: 64, flexDirection: 'row' }, rail: { width: 36, alignItems: 'center' }, stepIcon: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' }, done: { backgroundColor: colors.accent }, line: { width: 1, flex: 1, backgroundColor: colors.border }, lineDone: { backgroundColor: colors.accentStrong }, stepMain: { flex: 1, paddingTop: 3 }, stepTitle: { color: colors.text, fontSize: 12, fontWeight: '800' }, stepBody: { color: colors.muted, fontSize: 9, marginTop: 4 }, notes: { marginTop: spacing.md }, notesLabel: { color: colors.accent, fontSize: 9, fontWeight: '900' }, notesText: { color: colors.textSoft, fontSize: 11, lineHeight: 17, marginTop: 6 } });
