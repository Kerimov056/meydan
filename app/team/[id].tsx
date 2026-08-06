import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { api } from '@/src/api/endpoints';
import { MatchCard, TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, IconButton, Pill, PrimaryButton, SegmentedControl } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function TeamDetailsScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const [tab, setTab] = useState('Overview');
  const state = useAsyncData(async () => {
    const [team, matches] = await Promise.all([api.teams.show(id), api.matches.list()]);
    return { team, matches: matches.filter((item) => item.home.numericId === Number(id) || item.away?.numericId === Number(id)) };
  }, [id]);
  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Komanda tapılmadı.'} onRetry={state.reload} /></AppScreen>;
  const { team, matches } = state.data;
  return <AppScreen><View style={styles.header}><IconButton icon="arrow-back" onPress={() => router.back()} /><Text style={styles.headerTitle}>TEAM PROFILE</Text><IconButton icon="refresh" onPress={state.reload} /></View>
    <View style={styles.hero}><TeamAvatar team={team} size={82} /><Text style={styles.name}>{team.name}</Text><Text style={styles.handle}>{team.handle} · {team.district}</Text><View style={styles.pills}><Pill tone="accent" icon="shield-checkmark">{team.trustScore}% trust</Pill><Pill icon="people">{team.membersCount} oyunçu</Pill></View></View>
    <View style={styles.ratingRow}><Rating value={team.rating5v5} label="5V5 RATING" /><Divider /><Rating value={team.rating6v6} label="6V6 RATING" /><Divider /><Rating value={team.rank ? `#${team.rank}` : '—'} label="BAKI" accent /></View>
    <View style={styles.action}>
      <PrimaryButton label="Challenge göndər" icon="flash" onPress={() => router.push({ pathname: '/challenge/new', params: { opponent: team.id } })} />
      <View style={styles.actionGap} />
      <PrimaryButton
        secondary
        label="Heyət və düzülüş"
        icon="football-outline"
        onPress={() => router.push({
          pathname: '/team/[id]/lineup',
          params: {
            id: team.id,
            format: team.formats[0] ?? '5v5',
          },
        })}
      />
    </View>
    <SegmentedControl options={['Overview', 'Roster', 'Matches']} value={tab} onChange={setTab} />
    {tab === 'Overview' ? <View><Text style={styles.sectionTitle}>Season stats</Text><View style={styles.recordCard}><Record value={team.wins + team.draws + team.losses} label="Oyun" /><Record value={team.wins} label="Qələbə" accent /><Record value={team.draws} label="Heç-heçə" /><Record value={team.losses} label="Məğlubiyyət" /></View>{team.inviteCode ? <View style={styles.invite}><Text style={styles.inviteLabel}>DƏVƏT KODU</Text><Text style={styles.inviteCode}>{team.inviteCode}</Text></View> : null}</View> : null}
    {tab === 'Roster' ? <View><Text style={styles.sectionTitle}>Aktiv oyunçular</Text><View style={styles.rosterCard}>{team.members.length ? team.members.filter((item) => item.status === 'active').map((member) => <View key={member.id} style={styles.playerRow}><View style={styles.playerAvatar}><Text style={styles.initials}>{member.user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</Text></View><View style={styles.playerMain}><Text style={styles.playerName}>{member.user.name}</Text><Text style={styles.playerRole}>{member.role}{member.jersey_number ? ` · #${member.jersey_number}` : ''}</Text></View>{member.role === 'captain' ? <Ionicons name="star" size={15} color={colors.warning} /> : null}</View>) : <Text style={styles.empty}>Backend member siyahısı qaytarmadı.</Text>}</View></View> : null}
    {tab === 'Matches' ? <View style={styles.matches}>{matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} />) : <Text style={styles.empty}>Bu komandanın oyunu yoxdur.</Text>}</View> : null}
  </AppScreen>;
}

function Rating({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) { return <View style={styles.rating}><Text style={[styles.ratingValue, accent && styles.accent]}>{value}</Text><Text style={styles.ratingLabel}>{label}</Text></View>; }
function Record({ value, label, accent }: { value: number; label: string; accent?: boolean }) { return <View style={styles.record}><Text style={[styles.recordValue, accent && styles.accent]}>{value}</Text><Text style={styles.recordLabel}>{label}</Text></View>; }
function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, headerTitle: { color: colors.textSoft, fontSize: 10, fontWeight: '800' }, hero: { minHeight: 238, borderRadius: radii.xl, backgroundColor: '#102E20', borderWidth: 1, borderColor: '#315A40', alignItems: 'center', justifyContent: 'center' }, name: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 12 }, handle: { color: colors.muted, fontSize: 11, marginTop: 4 }, pills: { flexDirection: 'row', gap: 7, marginTop: 12 }, ratingRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginTop: 10, paddingVertical: spacing.lg }, rating: { flex: 1, alignItems: 'center' }, ratingValue: { color: colors.text, fontSize: 20, fontWeight: '900' }, ratingLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', marginTop: 4 }, accent: { color: colors.accent }, divider: { width: 1, height: 32, backgroundColor: colors.border }, action: { marginVertical: spacing.md }, actionGap: { height: spacing.sm }, sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.sm }, recordCard: { flexDirection: 'row', borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg }, record: { flex: 1, alignItems: 'center' }, recordValue: { color: colors.text, fontSize: 18, fontWeight: '900' }, recordLabel: { color: colors.muted, fontSize: 9, marginTop: 4 }, invite: { marginTop: spacing.md, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.accentDark, alignItems: 'center' }, inviteLabel: { color: colors.muted, fontSize: 8, fontWeight: '900' }, inviteCode: { color: colors.accent, fontSize: 22, fontWeight: '900', letterSpacing: 3, marginTop: 6 }, rosterCard: { borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, playerRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: colors.border }, playerAvatar: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' }, initials: { color: colors.textSoft, fontSize: 11, fontWeight: '900' }, playerMain: { flex: 1, marginLeft: 10 }, playerName: { color: colors.text, fontSize: 12, fontWeight: '800' }, playerRole: { color: colors.muted, fontSize: 9, marginTop: 3 }, matches: { marginTop: spacing.lg }, empty: { color: colors.muted, fontSize: 11, padding: spacing.md } });
