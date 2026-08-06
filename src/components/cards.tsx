import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Pill } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';
import { Match, Team } from '@/src/types';

export function TeamAvatar({ team, size = 48 }: { team: Team; size?: number }) {
  return (
    <View style={[styles.avatar, {
      width: size,
      height: size,
      borderRadius: size * 0.32,
      borderColor: `${team.accent}55`,
      backgroundColor: `${team.accent}18`,
    }]}>
      {team.logoUrl ? (
        <Image source={{ uri: team.logoUrl }} style={styles.teamLogoImage} />
      ) : (
        <Text style={[styles.avatarText, { color: team.accent, fontSize: size * 0.31 }]}>
          {team.initials}
        </Text>
      )}
    </View>
  );
}

export function TeamCard({ team, format = '5v5' }: { team: Team; format?: '5v5' | '6v6' }) {
  const rating = format === '5v5' ? team.rating5v5 : team.rating6v6;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/team/[id]', params: { id: team.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.teamCard}>
        <View style={styles.row}>
          <TeamAvatar team={team} />
          <View style={styles.teamMain}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamMeta}>{team.district} · {team.handle}</Text>
          </View>
          <View style={styles.ratingBlock}>
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.ratingLabel}>{format} rating</Text>
          </View>
        </View>
        <View style={styles.teamFooter}>
          <Pill tone="accent" icon="shield-checkmark">{team.trustScore}% trust</Pill>
          <Text style={styles.memberCount}>{team.membersCount} oyunçu</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const completed = ['verified', 'completed'].includes(match.status);
  const open = !match.away;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: match.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.matchCard}>
        <View style={styles.matchTop}>
          <Pill tone={completed ? 'accent' : match.status === 'cancelled' ? 'warning' : 'blue'} icon={completed ? 'checkmark-circle' : 'calendar'}>
            {completed ? 'Verified' : `${match.dateLabel} · ${match.time}`}
          </Pill>
          <Text style={styles.formatLabel}>{match.format} · {match.status}</Text>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.matchTeam}>
            <TeamAvatar team={match.home} size={42} />
            <Text style={styles.matchTeamName} numberOfLines={1}>{match.home.name}</Text>
          </View>
          <View style={styles.scoreCenter}>
            {completed && match.homeScore != null ? (
              <Text style={styles.score}>{match.homeScore} : {match.awayScore}</Text>
            ) : (
              <>
                <Text style={styles.versus}>{open ? 'OPEN' : 'VS'}</Text>
                <Text style={styles.kickoff}>{match.time}</Text>
              </>
            )}
          </View>
          <View style={[styles.matchTeam, styles.matchTeamRight]}>
            {match.away ? <TeamAvatar team={match.away} size={42} /> : <View style={styles.waiting}><Ionicons name="search" size={18} color={colors.accent} /></View>}
            <Text style={[styles.matchTeamName, styles.alignRight]} numberOfLines={1}>{match.away?.name ?? 'Rəqib gözlənilir'}</Text>
          </View>
        </View>
        <View style={styles.venueRow}>
          <Ionicons name="location-outline" size={15} color={colors.muted} />
          <Text style={styles.venueText} numberOfLines={1}>{match.venue.name}</Text>
          {match.ratingDelta ? <Text style={styles.delta}>+{match.ratingDelta}</Text> : null}
        </View>
      </Card>
    </Pressable>
  );
}

export function ChallengeCard({ challenge }: { challenge: Match }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/match/[id]', params: { id: challenge.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.challengeCard}>
        <View style={styles.row}>
          <TeamAvatar team={challenge.home} />
          <View style={styles.teamMain}>
            <Text style={styles.teamName}>{challenge.home.name}</Text>
            <Text style={styles.teamMeta}>Open challenge · {challenge.status}</Text>
          </View>
          <Pill tone="accent">{challenge.format}</Pill>
        </View>
        <View style={styles.challengeInfo}>
          <Info icon="calendar-outline" label={challenge.dateLabel} />
          <Info icon="time-outline" label={challenge.time} />
          <Info icon="location-outline" label={challenge.venue.district} />
        </View>
        <View style={styles.challengeBottom}>
          <Text style={styles.range}>Rating {challenge.ratingMin ?? '—'}–{challenge.ratingMax ?? '—'}</Text>
          <View style={styles.challengeButton}>
            <Text style={styles.challengeButtonText}>Bax və qəbul et</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.background} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function Info({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return <View style={styles.infoItem}><Ionicons name={icon} size={14} color={colors.muted} /><Text style={styles.infoText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarText: { fontWeight: '900', letterSpacing: -0.5 },
  teamLogoImage: { width: '100%', height: '100%' },
  waiting: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentStrong, alignItems: 'center', justifyContent: 'center' },
  teamCard: { marginBottom: spacing.sm, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  teamMain: { flex: 1, marginLeft: 12 },
  teamName: { color: colors.text, fontSize: 15, fontWeight: '800' },
  teamMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  ratingBlock: { alignItems: 'flex-end' },
  rating: { color: colors.text, fontSize: 18, fontWeight: '900' },
  ratingLabel: { color: colors.muted, fontSize: 9, marginTop: 2, textTransform: 'uppercase' },
  teamFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memberCount: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  matchCard: { marginBottom: spacing.sm },
  matchTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formatLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  matchTeam: { flex: 1, alignItems: 'flex-start', gap: 8 },
  matchTeamRight: { alignItems: 'flex-end' },
  matchTeamName: { color: colors.text, fontSize: 12, fontWeight: '700', maxWidth: 110 },
  alignRight: { textAlign: 'right' },
  scoreCenter: { width: 72, alignItems: 'center' },
  score: { color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: -1 },
  versus: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  kickoff: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 3 },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  venueText: { color: colors.muted, fontSize: 11, flex: 1 },
  delta: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  challengeCard: { marginBottom: spacing.sm },
  challengeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: spacing.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  infoText: { color: colors.textSoft, fontSize: 11, fontWeight: '600' },
  challengeBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  range: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  challengeButton: { minHeight: 38, borderRadius: 12, backgroundColor: colors.accent, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  challengeButtonText: { color: colors.background, fontSize: 12, fontWeight: '900' },
});
