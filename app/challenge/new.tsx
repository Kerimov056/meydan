import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/src/api/endpoints';
import { TeamAvatar } from '@/src/components/cards';
import { Choice, ErrorView, FormField, LoadingView } from '@/src/components/forms';
import { AppScreen, IconButton, Pill, PrimaryButton, SegmentedControl, Title } from '@/src/components/ui';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';
import { ChallengeType, MatchFormat } from '@/src/types';

const tomorrow = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
};

export default function NewChallengeScreen() {
  const { opponent } = useLocalSearchParams<{ opponent?: string }>();
  const state = useAsyncData(async () => {
    const [mine, teams, stadiums] = await Promise.all([api.teams.mine(), api.teams.list(), api.stadiums.list()]);
    return { mine, teams, stadiums };
  }, []);
  const [type, setType] = useState<ChallengeType>(opponent ? 'direct' : 'open');
  const [format, setFormat] = useState<MatchFormat>('5v5');
  const [homeTeamId, setHomeTeamId] = useState<number | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<number | null>(opponent ? Number(opponent) : null);
  const [stadiumId, setStadiumId] = useState<number | null>(null);
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState('20:00');
  const [ratingMin, setRatingMin] = useState('800');
  const [ratingMax, setRatingMax] = useState('1400');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedHome = state.data?.mine.find((item) => item.numericId === homeTeamId) ?? state.data?.mine[0];
  const effectiveHomeId = homeTeamId ?? selectedHome?.numericId ?? null;
  const opponents = useMemo(() => (state.data?.teams ?? []).filter((item) => item.numericId !== effectiveHomeId && item.formats.includes(format)), [effectiveHomeId, format, state.data]);
  const stadiums = (state.data?.stadiums ?? []).filter((item) => item.formats.includes(format));

  if (state.loading) return <AppScreen><LoadingView /></AppScreen>;
  if (state.error || !state.data) return <AppScreen><ErrorView message={state.error ?? 'Form məlumatları alınmadı.'} onRetry={state.reload} /></AppScreen>;

  const submit = async () => {
    if (!effectiveHomeId || !stadiumId || (type === 'direct' && !awayTeamId)) {
      Alert.alert('Seçim tamamlanmayıb', 'Komanda, rəqib və stadion seçimlərini yoxlayın.');
      return;
    }
    setBusy(true);
    try {
      const created = await api.matches.create({
        home_team_id: effectiveHomeId,
        away_team_id: type === 'direct' ? awayTeamId! : undefined,
        stadium_id: stadiumId,
        challenge_type: type,
        format,
        scheduled_at: `${date}T${time}:00+04:00`,
        duration_minutes: 60,
        rating_min: type === 'open' ? Number(ratingMin) : undefined,
        rating_max: type === 'open' ? Number(ratingMax) : undefined,
        notes: notes || undefined,
      });
      Alert.alert('Challenge yaradıldı', 'Ranked oyun backend-də yaradıldı.', [{ text: 'Oyuna bax', onPress: () => router.replace(`/match/${created.id}`) }]);
    } catch (error) {
      Alert.alert('Challenge yaradılmadı', error instanceof Error ? error.message : 'Məlumatları yoxlayın.');
    } finally {
      setBusy(false);
    }
  };

  return <AppScreen><View style={styles.header}><IconButton icon="close" onPress={() => router.back()} /><Text style={styles.headerTitle}>NEW MATCH</Text><View style={{ width: 42 }} /></View><Title>Challenge yarat</Title><Text style={styles.subtitle}>Ranked oyun üçün rəqib, vaxt və stadion seç.</Text>
    <Text style={styles.label}>Challenge növü</Text><SegmentedControl options={['open', 'direct']} value={type} onChange={(value) => setType(value as ChallengeType)} />
    <Text style={styles.label}>Sənin komandan</Text><View style={styles.list}>{state.data.mine.map((team) => <Pressable key={team.id} onPress={() => setHomeTeamId(team.numericId)} style={[styles.row, effectiveHomeId === team.numericId && styles.active]}><TeamAvatar team={team} size={40} /><Text style={styles.rowName}>{team.name}</Text>{effectiveHomeId === team.numericId ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}</Pressable>)}</View>
    <Text style={styles.label}>Format</Text><View style={styles.options}><Choice label="5v5" active={format === '5v5'} onPress={() => setFormat('5v5')} /><Choice label="6v6" active={format === '6v6'} onPress={() => setFormat('6v6')} /></View>
    {type === 'direct' ? <><Text style={styles.label}>Rəqib komanda</Text><View style={styles.list}>{opponents.map((team) => <Pressable key={team.id} onPress={() => setAwayTeamId(team.numericId)} style={[styles.row, awayTeamId === team.numericId && styles.active]}><TeamAvatar team={team} size={40} /><View style={{ flex: 1 }}><Text style={styles.rowName}>{team.name}</Text><Text style={styles.rowMeta}>{team.district}</Text></View>{awayTeamId === team.numericId ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}</Pressable>)}</View></> : <><Text style={styles.label}>Rating aralığı</Text><View style={styles.options}><View style={{ flex: 1 }}><FormField label="Minimum" value={ratingMin} onChangeText={setRatingMin} keyboardType="number-pad" /></View><View style={{ flex: 1 }}><FormField label="Maksimum" value={ratingMax} onChangeText={setRatingMax} keyboardType="number-pad" /></View></View></>}
    <View style={styles.options}><View style={{ flex: 1 }}><FormField label="Tarix (YYYY-MM-DD)" value={date} onChangeText={setDate} /></View><View style={{ flex: 1 }}><FormField label="Saat" value={time} onChangeText={setTime} /></View></View>
    <Text style={styles.label}>Stadion</Text><View style={styles.list}>{stadiums.map((venue) => <Pressable key={venue.id} onPress={() => setStadiumId(venue.numericId)} style={[styles.row, stadiumId === venue.numericId && styles.active]}><View style={styles.venueIcon}><Ionicons name="location" size={19} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={styles.rowName}>{venue.name}</Text><Text style={styles.rowMeta}>{venue.district}</Text></View>{stadiumId === venue.numericId ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}</Pressable>)}</View>
    <FormField label="Qeyd" value={notes} onChangeText={setNotes} multiline placeholder="Məsələn, oyundan 15 dəqiqə əvvəl gələk" />
    <View style={styles.summary}><Pill tone="accent" icon="flash">Ranked</Pill><Text style={styles.summaryText}>{format} · {date} · {time}</Text></View><PrimaryButton label={busy ? 'Yaradılır...' : type === 'open' ? 'Challenge yayımla' : 'Challenge göndər'} disabled={busy || !state.data.mine.length} icon="paper-plane" onPress={submit} />
  </AppScreen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }, headerTitle: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 7 }, label: { color: colors.textSoft, fontSize: 12, fontWeight: '800', marginTop: spacing.xl, marginBottom: 9 }, options: { flexDirection: 'row', gap: 8 }, list: { gap: 8 }, row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, active: { backgroundColor: '#102A1E', borderColor: colors.accentStrong }, rowName: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '800' }, rowMeta: { color: colors.muted, fontSize: 9, marginTop: 3 }, venueIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' }, summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.lg }, summaryText: { color: colors.textSoft, fontSize: 12, fontWeight: '800' } });
