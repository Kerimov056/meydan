import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { useAuth } from '@/src/auth/AuthProvider';
import { MatchCard, TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import { AppScreen, EmptyState, IconButton, Pill, SectionHeader } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const [teams, matches] = await Promise.all([api.teams.mine(), api.matches.mine()]);
    return { teams, matches };
  }, []);

  if (state.loading) return <AppScreen><LoadingView label="Meydan hazırlanır..." /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Məlumat yoxdur.'} onRetry={state.reload} /></AppScreen>;

  const team = state.data.teams[0];
  const upcoming = state.data.matches.find((match) => !['rejected', 'cancelled', 'verified', 'completed'].includes(match.status));
  const recent = state.data.matches.filter((match) => ['verified', 'completed', 'rejected', 'cancelled'].includes(match.status)).slice(0, 3);

  return (
    <AppScreen>
      <View style={styles.header}>
        <View><Text style={styles.hello}>Xoş gəldin, {user?.name?.split(' ')[0]}</Text><Pressable style={styles.teamSwitcher} onPress={() => team && router.push(`/team/${team.id}`)}><View style={styles.teamDot} /><Text style={styles.teamName}>{team?.name ?? 'Komandan yoxdur'}</Text><Ionicons name="chevron-forward" size={15} color={colors.muted} /></Pressable></View>
        <IconButton icon="refresh" onPress={state.reload} />
      </View>

      {upcoming ? (
        <LinearGradient colors={['#153B29', '#0C2118']} style={styles.heroCard}>
          <View style={styles.heroTop}><Pill tone="accent" icon="calendar">Növbəti oyun</Pill><Text style={styles.heroDate}>{upcoming.dateLabel} · {upcoming.time}</Text></View>
          <View style={styles.versusRow}>
            <View style={styles.heroTeam}><TeamAvatar team={upcoming.home} size={54} /><Text style={styles.heroTeamName}>{upcoming.home.name}</Text></View>
            <View style={styles.vsWrap}><Text style={styles.vs}>{upcoming.away ? 'VS' : 'OPEN'}</Text><Pill>{upcoming.format}</Pill></View>
            <View style={[styles.heroTeam, styles.heroTeamRight]}>{upcoming.away ? <TeamAvatar team={upcoming.away} size={54} /> : <Ionicons name="search" size={28} color={colors.accent} />}<Text style={[styles.heroTeamName, styles.alignRight]}>{upcoming.away?.name ?? 'Rəqib gözlənilir'}</Text></View>
          </View>
          <Pressable onPress={() => router.push(`/match/${upcoming.id}`)} style={styles.venueBar}><Ionicons name="location" size={17} color={colors.accent} /><View style={styles.venueMain}><Text style={styles.venueName}>{upcoming.venue.name}</Text><Text style={styles.venueMeta}>{upcoming.status} · {upcoming.format}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>
        </LinearGradient>
      ) : <EmptyState icon="calendar-outline" title="Yaxın oyun yoxdur" body="Open challenge yarat və ya rəqib komandaya meydan oxu." />}

      <View style={styles.actionsRow}>
        <QuickAction icon="search" title="Rəqib tap" body="Bakıda aktiv komandalar" onPress={() => router.push('/explore')} />
        <QuickAction icon="add-circle" title="Challenge" body="Ranked oyun yarat" onPress={() => router.push('/challenge/new')} />
      </View>

      <SectionHeader title="Komanda" action={team ? 'Profil' : 'Yarat'} onAction={() => router.push(team ? `/team/${team.id}` : '/team/create')} />
      {team ? <View style={styles.statsCard}><Stat value={team.rating5v5} label="5V5 RATING" /><Divider /><Stat value={team.rating6v6} label="6V6 RATING" /><Divider /><Stat value={`${team.trustScore}%`} label="TRUST" accent /></View> : <EmptyState icon="people-outline" title="Komanda qur" body="Challenge yaratmaq üçün əvvəlcə komanda yarat və ya dəvət kodu ilə qoşul." />}

      <SectionHeader title="Son oyunlar" action="Hamısı" onAction={() => router.push('/matches')} />
      {recent.length ? recent.map((match) => <MatchCard key={match.id} match={match} />) : <Text style={styles.muted}>Hələ oyun tarixçəsi yoxdur.</Text>}
    </AppScreen>
  );
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) { return <View style={styles.statBlock}><Text style={[styles.statValue, accent && styles.trust]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function Divider() { return <View style={styles.statDivider} />; }
function QuickAction({ icon, title, body, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; body: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.quickAction}><View style={styles.quickIcon}><Ionicons name={icon} size={21} color={colors.accent} /></View><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickBody}>{body}</Text></Pressable>; }

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  hello: { color: colors.muted, fontSize: 12, marginBottom: 5 }, teamSwitcher: { flexDirection: 'row', alignItems: 'center', gap: 7 }, teamDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }, teamName: { color: colors.text, fontSize: 18, fontWeight: '900' },
  heroCard: { padding: spacing.md, borderRadius: radii.xl, borderWidth: 1, borderColor: '#356347', overflow: 'hidden' }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroDate: { color: colors.textSoft, fontSize: 11, fontWeight: '800' },
  versusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg }, heroTeam: { flex: 1, gap: 9, alignItems: 'flex-start' }, heroTeamRight: { alignItems: 'flex-end' }, heroTeamName: { color: colors.text, fontSize: 13, fontWeight: '800', maxWidth: 110 }, alignRight: { textAlign: 'right' }, vsWrap: { width: 74, alignItems: 'center', gap: 7 }, vs: { color: colors.muted, fontSize: 14, fontWeight: '900' },
  venueBar: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: radii.md, backgroundColor: '#06100D99', gap: 10 }, venueMain: { flex: 1 }, venueName: { color: colors.text, fontSize: 11, fontWeight: '800' }, venueMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md }, quickAction: { flex: 1, minHeight: 126, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14 }, quickIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center', marginBottom: 11 }, quickTitle: { color: colors.text, fontSize: 13, fontWeight: '800' }, quickBody: { color: colors.muted, fontSize: 9, marginTop: 3 },
  statsCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg }, statBlock: { flex: 1, alignItems: 'center' }, statValue: { color: colors.text, fontSize: 21, fontWeight: '900' }, trust: { color: colors.accent }, statLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', marginTop: 4 }, statDivider: { width: 1, height: 34, backgroundColor: colors.border }, muted: { color: colors.muted, fontSize: 11 },
});
