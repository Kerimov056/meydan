import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api } from '@/src/api/endpoints';
import { TeamAvatar } from '@/src/components/cards';
import { ErrorView, LoadingView } from '@/src/components/forms';
import {
  AppScreen,
  IconButton,
  Pill,
  PrimaryButton,
  SegmentedControl,
} from '@/src/components/ui';
import { useAuth } from '@/src/auth/AuthProvider';
import { useAsyncData } from '@/src/hooks/useAsyncData';
import { colors, radii, spacing } from '@/src/theme';
import {
  LineupPositionCode,
  MatchFormat,
  TeamLineupMember,
  TeamLineupPlayer,
} from '@/src/types';

const POSITION_CODES: LineupPositionCode[] = [
  'GK',
  'LB',
  'CB',
  'RB',
  'DM',
  'CM',
  'AM',
  'LW',
  'RW',
  'ST',
];

const POSITION_COORDINATES: Record<LineupPositionCode, { x: number; y: number }> = {
  GK: { x: 50, y: 9 },
  LB: { x: 23, y: 34 },
  CB: { x: 50, y: 32 },
  RB: { x: 77, y: 34 },
  DM: { x: 50, y: 48 },
  CM: { x: 50, y: 60 },
  AM: { x: 50, y: 70 },
  LW: { x: 22, y: 78 },
  RW: { x: 78, y: 78 },
  ST: { x: 50, y: 88 },
};

const DEFAULT_SLOTS: Record<MatchFormat, LineupPositionCode[]> = {
  '5v5': ['GK', 'LB', 'RB', 'CM', 'ST'],
  '6v6': ['GK', 'LB', 'CB', 'RB', 'CM', 'ST'],
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'P';
}

function positionFromPoint(x: number, y: number): LineupPositionCode {
  if (y <= 18) return 'GK';
  if (y <= 44) {
    if (x < 35) return 'LB';
    if (x > 65) return 'RB';
    return 'CB';
  }
  if (y <= 55) return 'DM';
  if (y <= 69) return x < 28 ? 'LW' : x > 72 ? 'RW' : 'CM';
  if (y <= 80) return x < 35 ? 'LW' : x > 65 ? 'RW' : 'AM';
  return x < 35 ? 'LW' : x > 65 ? 'RW' : 'ST';
}

export default function TeamLineupScreen() {
  const params = useLocalSearchParams<{ id?: string; format?: string }>();
  const id = params.id ?? '';
  const initialFormat: MatchFormat = params.format === '6v6' ? '6v6' : '5v5';
  const [format, setFormat] = useState<MatchFormat>(initialFormat);
  const [draft, setDraft] = useState<TeamLineupPlayer[]>([]);
  const [bench, setBench] = useState<TeamLineupMember[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { user } = useAuth();

  const state = useAsyncData(async () => {
    const team = await api.teams.show(id);
    const effectiveFormat = team.formats.includes(format)
      ? format
      : (team.formats[0] ?? '5v5');
    const lineup = await api.teams.lineup(id, effectiveFormat);
    return { team, lineup, effectiveFormat };
  }, [id, format]);

  useEffect(() => {
    if (!state.data) return;

    setDraft(state.data.lineup.players);
    setBench(state.data.lineup.bench);
    setSelectedMemberId(null);
    setEditing(false);
  }, [state.data]);

  if (state.loading) {
    return <AppScreen><LoadingView label="Düzülüş yüklənir..." /></AppScreen>;
  }

  if (state.error || !state.data) {
    return (
      <AppScreen>
        <ErrorView
          message={state.error ?? 'Komanda düzülüşü tapılmadı.'}
          onRetry={state.reload}
        />
      </AppScreen>
    );
  }

  const { team, lineup, effectiveFormat } = state.data;
  const activeMembership = team.members.find(
    (member) => member.status === 'active' && member.user_id === user?.id,
  );
  const canManage = Boolean(
    user && (
      user.role === 'super_admin'
      || team.ownerUserId === user.id
      || activeMembership?.role === 'captain'
      || activeMembership?.role === 'co_captain'
    ),
  );
  const maximumPlayers = effectiveFormat === '6v6' ? 6 : 5;
  const selectedPlayer = draft.find(
    (player) => player.team_member_id === selectedMemberId,
  );

  function changeFormat(next: string) {
    const nextFormat = next as MatchFormat;

    if (nextFormat === format) {
      return;
    }

    setEditing(false);
    setSelectedMemberId(null);
    setFormat(nextFormat);
  }

  function startEditing() {
    setDraft(lineup.players);
    setBench(lineup.bench);
    setSelectedMemberId(lineup.players[0]?.team_member_id ?? null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(lineup.players);
    setBench(lineup.bench);
    setSelectedMemberId(null);
    setEditing(false);
  }

  function movePlayer(teamMemberId: number, x: number, y: number) {
    setDraft((current) => current.map((player) => (
      player.team_member_id === teamMemberId
        ? {
          ...player,
          x_percent: x,
          y_percent: y,
          position_code: positionFromPoint(x, y),
        }
        : player
    )));
  }

  function changePosition(position: LineupPositionCode) {
    if (selectedMemberId == null) return;
    const coordinate = POSITION_COORDINATES[position];
    setDraft((current) => current.map((player) => (
      player.team_member_id === selectedMemberId
        ? {
          ...player,
          position_code: position,
          x_percent: coordinate.x,
          y_percent: coordinate.y,
        }
        : player
    )));
  }

  function addToPitch(member: TeamLineupMember) {
    if (draft.length >= maximumPlayers) {
      Alert.alert(
        'Meydan doludur',
        `${effectiveFormat} üçün maksimum ${maximumPlayers} oyunçu seçilə bilər.`,
      );
      return;
    }

    const position = DEFAULT_SLOTS[effectiveFormat][draft.length] ?? 'CM';
    const coordinate = POSITION_COORDINATES[position];
    const newPlayer: TeamLineupPlayer = {
      ...member,
      id: -member.team_member_id,
      position_code: position,
      x_percent: coordinate.x,
      y_percent: coordinate.y,
    };

    setDraft((current) => [...current, newPlayer]);
    setBench((current) => current.filter(
      (item) => item.team_member_id !== member.team_member_id,
    ));
    setSelectedMemberId(member.team_member_id);
  }

  function sendToBench(teamMemberId: number) {
    const player = draft.find((item) => item.team_member_id === teamMemberId);
    if (!player) return;

    setDraft((current) => current.filter(
      (item) => item.team_member_id !== teamMemberId,
    ));
    setBench((current) => [
      ...current,
      {
        team_member_id: player.team_member_id,
        role: player.role,
        jersey_number: player.jersey_number,
        user: player.user,
      },
    ]);
    setSelectedMemberId(null);
  }

  async function saveLineup() {
    setSaving(true);
    try {
      const saved = await api.teams.saveLineup(
        id,
        effectiveFormat,
        draft.map((player) => ({
          team_member_id: player.team_member_id,
          position_code: player.position_code,
          x_percent: Number(player.x_percent.toFixed(2)),
          y_percent: Number(player.y_percent.toFixed(2)),
        })),
      );
      setDraft(saved.players);
      setBench(saved.bench);
      setSelectedMemberId(null);
      setEditing(false);
      Alert.alert('Hazırdır', 'Komanda düzülüşü yadda saxlanıldı.');
      await state.reload();
    } catch (caught) {
      Alert.alert(
        'Yadda saxlanmadı',
        caught instanceof Error ? caught.message : 'Yenidən yoxlayın.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => router.back()} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>HEYƏT VƏ DÜZÜLÜŞ</Text>
          <Text style={styles.headerTitle}>{team.name}</Text>
        </View>
        <IconButton icon="refresh" onPress={state.reload} />
      </View>

      <View style={styles.teamCard}>
        <TeamAvatar team={team} size={58} />
        <View style={styles.teamMain}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamMeta}>
            {draft.length}/{maximumPlayers} meydanda · {bench.length} ehtiyatda
          </Text>
        </View>
        {canManage ? (
          <Pill tone="accent" icon="shield-checkmark">İdarəçi</Pill>
        ) : (
          <Pill icon="eye-outline">Baxış</Pill>
        )}
      </View>

      <View style={styles.formatBlock}>
        <SegmentedControl
          options={team.formats.length ? team.formats : [effectiveFormat]}
          value={effectiveFormat}
          onChange={changeFormat}
        />
      </View>

      <View style={styles.pitchHeader}>
        <View>
          <Text style={styles.sectionTitle}>Əsas heyət</Text>
          <Text style={styles.sectionHint}>
            {editing
              ? 'Oyunçunu tutub meydanda istədiyiniz yerə sürüşdürün.'
              : 'Bu düzülüşü bütün Meydan istifadəçiləri görə bilər.'}
          </Text>
        </View>
        {editing ? <Pill tone="warning" icon="move-outline">Redaktə</Pill> : null}
      </View>

      <FootballPitch
        players={draft}
        editable={editing}
        selectedMemberId={selectedMemberId}
        onSelect={setSelectedMemberId}
        onMove={movePlayer}
      />

      {editing && selectedPlayer ? (
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <View>
              <Text style={styles.editorTitle}>{selectedPlayer.user.name}</Text>
              <Text style={styles.editorHint}>Mövqeni seçin və ya oyunçunu sürüşdürün</Text>
            </View>
            <Pressable
              onPress={() => sendToBench(selectedPlayer.team_member_id)}
              style={styles.benchButton}
            >
              <Ionicons name="arrow-down" size={14} color={colors.warning} />
              <Text style={styles.benchButtonText}>Ehtiyata</Text>
            </Pressable>
          </View>
          <View style={styles.positionGrid}>
            {POSITION_CODES.map((position) => {
              const active = selectedPlayer.position_code === position;
              return (
                <Pressable
                  key={position}
                  onPress={() => changePosition(position)}
                  style={[styles.positionChip, active && styles.positionChipActive]}
                >
                  <Text style={[styles.positionText, active && styles.positionTextActive]}>
                    {position}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Ehtiyat oyunçular</Text>
          <Text style={styles.sectionHint}>
            {editing ? '“Meydana” düyməsi ilə oyunçu əlavə edin.' : 'Hazırkı düzülüşə daxil olmayan üzvlər.'}
          </Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>{bench.length}</Text></View>
      </View>

      <View style={styles.benchCard}>
        {bench.length ? bench.map((member) => (
          <View key={member.team_member_id} style={styles.memberRow}>
            <PlayerAvatar name={member.user.name} uri={member.user.avatar_url} size={42} />
            <View style={styles.memberMain}>
              <Text style={styles.memberName}>{member.user.name}</Text>
              <Text style={styles.memberMeta}>
                {member.role}{member.jersey_number ? ` · #${member.jersey_number}` : ''}
              </Text>
            </View>
            {editing ? (
              <Pressable onPress={() => addToPitch(member)} style={styles.addButton}>
                <Ionicons name="add" size={16} color={colors.background} />
                <Text style={styles.addButtonText}>Meydana</Text>
              </Pressable>
            ) : null}
          </View>
        )) : (
          <View style={styles.emptyBench}>
            <Ionicons name="people-outline" size={24} color={colors.muted} />
            <Text style={styles.emptyText}>Ehtiyat oyunçu yoxdur.</Text>
          </View>
        )}
      </View>

      {canManage ? (
        <View style={styles.actions}>
          {editing ? (
            <>
              <PrimaryButton
                label={saving ? 'Yadda saxlanılır...' : 'Düzülüşü yadda saxla'}
                icon="checkmark-circle"
                disabled={saving}
                onPress={saveLineup}
              />
              <View style={styles.actionGap} />
              <PrimaryButton
                secondary
                label="Dəyişiklikləri ləğv et"
                icon="close"
                disabled={saving}
                onPress={cancelEditing}
              />
            </>
          ) : (
            <PrimaryButton
              secondary
              label="Düzülüşü redaktə et"
              icon="create-outline"
              onPress={startEditing}
            />
          )}
        </View>
      ) : (
        <View style={styles.readOnlyNote}>
          <Ionicons name="eye-outline" size={18} color={colors.blue} />
          <Text style={styles.readOnlyText}>
            Düzülüş hamı üçün açıqdır. Yalnız komanda idarəçiləri dəyişiklik edə bilər.
          </Text>
        </View>
      )}
    </AppScreen>
  );
}

function FootballPitch({
  players,
  editable,
  selectedMemberId,
  onSelect,
  onMove,
}: {
  players: TeamLineupPlayer[];
  editable: boolean;
  selectedMemberId: number | null;
  onSelect: (teamMemberId: number) => void;
  onMove: (teamMemberId: number, x: number, y: number) => void;
}) {
  const [size, setSize] = useState({ width: 340, height: 520 });

  function measure(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    const height = Math.min(620, Math.max(490, width * 1.36));
    setSize({ width, height });
  }

  return (
    <View
      onLayout={measure}
      style={[styles.pitch, { height: size.height }]}
    >
      <View style={styles.touchLine} />
      <View style={styles.halfwayLine} />
      <View style={styles.centerCircle} />
      <View style={styles.centerSpot} />
      <View style={styles.penaltyTop} />
      <View style={styles.goalAreaTop} />
      <View style={styles.penaltyBottom} />
      <View style={styles.goalAreaBottom} />
      <View style={styles.goalTop} />
      <View style={styles.goalBottom} />
      <Text style={styles.ownGoalLabel}>ÖZ QAPIN</Text>
      <Text style={styles.opponentGoalLabel}>RƏQİB QAPISI</Text>

      {players.map((player) => (
        <DraggablePlayer
          key={player.team_member_id}
          player={player}
          pitchSize={size}
          editable={editable}
          selected={selectedMemberId === player.team_member_id}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}
    </View>
  );
}

function DraggablePlayer({
  player,
  pitchSize,
  editable,
  selected,
  onSelect,
  onMove,
}: {
  player: TeamLineupPlayer;
  pitchSize: { width: number; height: number };
  editable: boolean;
  selected: boolean;
  onSelect: (teamMemberId: number) => void;
  onMove: (teamMemberId: number, x: number, y: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const markerWidth = 68;
  const markerHeight = 82;

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => editable,
    onMoveShouldSetPanResponder: (_, gesture) => (
      editable && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2)
    ),
    onPanResponderGrant: () => onSelect(player.team_member_id),
    onPanResponderMove: (_, gesture) => {
      pan.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      const nextX = clamp(
        player.x_percent + (gesture.dx / pitchSize.width) * 100,
        7,
        93,
      );
      const nextY = clamp(
        player.y_percent + (gesture.dy / pitchSize.height) * 100,
        7,
        93,
      );
      pan.setValue({ x: 0, y: 0 });
      onMove(player.team_member_id, nextX, nextY);
    },
    onPanResponderTerminate: () => pan.setValue({ x: 0, y: 0 }),
  }), [editable, onMove, onSelect, pan, pitchSize.height, pitchSize.width, player]);

  const left = (player.x_percent / 100) * pitchSize.width - markerWidth / 2;
  const top = (player.y_percent / 100) * pitchSize.height - markerHeight / 2;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.playerMarker,
        { left, top, transform: pan.getTranslateTransform() },
        selected && styles.playerMarkerSelected,
      ]}
    >
      <Pressable
        onPress={() => editable && onSelect(player.team_member_id)}
        style={styles.markerPressable}
      >
        <View style={[styles.positionBadge, selected && styles.positionBadgeSelected]}>
          <Text style={[styles.positionBadgeText, selected && styles.positionBadgeTextSelected]}>
            {player.position_code}
          </Text>
        </View>
        <PlayerAvatar
          name={player.user.name}
          uri={player.user.avatar_url}
          size={45}
          selected={selected}
        />
        <Text numberOfLines={1} style={styles.markerName}>
          {player.user.name.split(/\s+/)[0]}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function PlayerAvatar({
  name,
  uri,
  size,
  selected = false,
}: {
  name: string;
  uri?: string | null;
  size: number;
  selected?: boolean;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        selected && styles.avatarSelected,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarInitials}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerEyebrow: { color: colors.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 3 },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  teamMain: { flex: 1, marginLeft: spacing.sm },
  teamName: { color: colors.text, fontSize: 17, fontWeight: '900' },
  teamMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
  formatBlock: { marginTop: spacing.md },
  pitchHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  sectionHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4, maxWidth: 470 },
  pitch: {
    position: 'relative',
    width: '100%',
    minHeight: 490,
    maxHeight: 620,
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: '#167342',
    borderWidth: 1,
    borderColor: '#4CBF78',
  },
  touchLine: {
    position: 'absolute',
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  halfwayLine: {
    position: 'absolute',
    left: 15,
    right: 15,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  centerCircle: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    left: '50%',
    top: '50%',
    marginLeft: -46,
    marginTop: -46,
  },
  centerSpot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    left: '50%',
    top: '50%',
    marginLeft: -3,
    marginTop: -3,
  },
  penaltyTop: {
    position: 'absolute',
    width: '54%',
    height: 82,
    left: '23%',
    top: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  goalAreaTop: {
    position: 'absolute',
    width: '29%',
    height: 36,
    left: '35.5%',
    top: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  penaltyBottom: {
    position: 'absolute',
    width: '54%',
    height: 82,
    left: '23%',
    bottom: 15,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  goalAreaBottom: {
    position: 'absolute',
    width: '29%',
    height: 36,
    left: '35.5%',
    bottom: 15,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  goalTop: {
    position: 'absolute',
    width: '22%',
    height: 9,
    left: '39%',
    top: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  goalBottom: {
    position: 'absolute',
    width: '22%',
    height: 9,
    left: '39%',
    bottom: 6,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  ownGoalLabel: {
    position: 'absolute',
    left: 25,
    top: 24,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  opponentGoalLabel: {
    position: 'absolute',
    right: 25,
    bottom: 24,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  playerMarker: {
    position: 'absolute',
    width: 68,
    minHeight: 82,
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  playerMarkerSelected: {
    backgroundColor: 'rgba(5,20,13,0.28)',
    zIndex: 10,
  },
  markerPressable: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  positionBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    minWidth: 25,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#092116',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    zIndex: 3,
  },
  positionBadgeSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  positionBadgeText: { color: colors.white, fontSize: 7, fontWeight: '900' },
  positionBadgeTextSelected: { color: colors.background },
  markerName: {
    maxWidth: 65,
    color: colors.white,
    backgroundColor: 'rgba(4,20,12,0.86)',
    borderRadius: 7,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 3,
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  avatarSelected: { borderColor: colors.accent, borderWidth: 3 },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { color: colors.text, fontSize: 11, fontWeight: '900' },
  editorCard: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  editorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editorTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  editorHint: { color: colors.muted, fontSize: 9, marginTop: 3 },
  benchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    backgroundColor: '#3A2C13',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  benchButtonText: { color: colors.warning, fontSize: 9, fontWeight: '900' },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: spacing.md },
  positionChip: {
    minWidth: 47,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  positionText: { color: colors.textSoft, fontSize: 10, fontWeight: '900' },
  positionTextActive: { color: colors.background },
  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: colors.textSoft, fontSize: 11, fontWeight: '900' },
  benchCard: {
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  memberRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberMain: { flex: 1, marginLeft: spacing.sm },
  memberName: { color: colors.text, fontSize: 12, fontWeight: '900' },
  memberMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  addButtonText: { color: colors.background, fontSize: 9, fontWeight: '900' },
  emptyBench: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: colors.muted, fontSize: 10 },
  actions: { marginTop: spacing.lg },
  actionGap: { height: spacing.sm },
  readOnlyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#20466B',
    backgroundColor: '#102236',
    padding: spacing.md,
  },
  readOnlyText: { flex: 1, color: colors.textSoft, fontSize: 10, lineHeight: 16 },
});
