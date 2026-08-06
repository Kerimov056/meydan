import {
  ApiUser,
  Match,
  MatchFormat,
  MatchRoster,
  MatchRosterPlayer,
  StadiumFormat,
  StadiumPhoto,
  Team,
  TeamLineup,
  TeamLineupMember,
  TeamLineupPlayer,
  TeamMember,
  TeamRating,
  Venue,
} from '@/src/types';

const accents = ['#76F78B', '#79A8FF', '#F6C768', '#B99CFF', '#FF8A7A'];
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'FC';
}

function relationItems(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function mapUser(raw: any): ApiUser {
  const source = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw ?? {};
  return {
    id: number(source.id),
    name: source.name ?? 'Meydan user',
    email: source.email ?? null,
    phone: source.phone ?? null,
    phone_verified_at: source.phone_verified_at ?? null,
    avatar_url: source.avatar_url ?? null,
    role: source.role ?? 'user',
    username: source.username ?? source.handle?.replace(/^@/, '') ?? null,
    position: source.position ?? source.primary_position ?? null,
    district: source.district ?? null,
    bio: source.bio ?? null,
    profile_completed_at: source.profile_completed_at ?? null,
  };
}

function mapRatings(raw: any): TeamRating[] {
  const list = relationItems(raw?.ratings ?? raw?.team_ratings);
  return list.map((item) => ({
    format: item.format as MatchFormat,
    rating: number(item.rating, 1000),
    wins: number(item.wins),
    draws: number(item.draws),
    losses: number(item.losses),
    played: number(item.played ?? item.games_played, number(item.wins) + number(item.draws) + number(item.losses)),
    rank: item.rank == null ? null : number(item.rank),
  }));
}

function ratingFor(raw: any, ratings: TeamRating[], format: MatchFormat) {
  return number(
    raw?.[`rating_${format}`] ?? raw?.[format === '5v5' ? 'rating5v5' : 'rating6v6'] ??
      raw?.ratings?.[format]?.rating ?? ratings.find((item) => item.format === format)?.rating,
    1000,
  );
}

export function mapTeam(raw: any, index = 0): Team {
  const source = raw?.team ?? raw?.data ?? raw ?? {};
  const id = number(source.id);
  const ratings = mapRatings(source);
  const members: TeamMember[] = relationItems(source.members).map((item: any) => ({
    id: number(item.id),
    user_id: number(item.user_id ?? item.user?.id),
    role: item.role ?? 'player',
    status: item.status ?? 'active',
    jersey_number: item.jersey_number ?? null,
    joined_at: item.joined_at ?? null,
    user: mapUser(item.user ?? item),
  }));
  const formats = relationItems(source.formats).length
    ? relationItems(source.formats).map((item) => typeof item === 'string' ? item : item.format)
    : Array.isArray(source.formats) ? source.formats : ['5v5'];
  const wins = number(source.wins ?? ratings.reduce((sum, item) => sum + item.wins, 0));
  const draws = number(source.draws ?? ratings.reduce((sum, item) => sum + item.draws, 0));
  const losses = number(source.losses ?? ratings.reduce((sum, item) => sum + item.losses, 0));

  return {
    id: String(id),
    numericId: id,
    name: source.name ?? 'Komanda',
    handle: source.handle ? (String(source.handle).startsWith('@') ? source.handle : `@${source.handle}`) : `@team${id}`,
    shortName: source.short_name ?? null,
    logoUrl: source.logo_url ?? null,
    initials: source.short_name ?? initials(source.name ?? 'Komanda'),
    district: source.district ?? 'Bakı',
    formats: formats.filter((item: string) => item === '5v5' || item === '6v6'),
    accent: accents[id % accents.length] ?? accents[index % accents.length],
    rating5v5: ratingFor(source, ratings, '5v5'),
    rating6v6: ratingFor(source, ratings, '6v6'),
    trustScore: number(source.trust_score ?? source.trustScore, 100),
    wins,
    draws,
    losses,
    form: (source.form ?? []).filter((item: string) => ['W', 'D', 'L'].includes(item)),
    rank: number(source.rank ?? ratings.find((item) => item.format === '5v5')?.rank, 0),
    status: source.status ?? 'active',
    membersCount: number(source.members_count, members.length),
    inviteCode: source.invite_code ?? null,
    ownerUserId: (
      source.owner_id ?? source.owner?.id ?? source.owner_user_id ?? source.created_by
    ) == null
      ? null
      : number(source.owner_id ?? source.owner?.id ?? source.owner_user_id ?? source.created_by),
    members,
    ratings,
    raw,
  };
}

export function mapTeamLineup(raw: any): TeamLineup {
  const source = raw?.data ?? raw ?? {};

  const mapLineupMember = (item: any): TeamLineupMember => ({
    team_member_id: number(item.team_member_id ?? item.id),
    role: item.role ?? 'player',
    jersey_number: item.jersey_number ?? null,
    user: mapUser(item.user ?? {}),
  });

  const players: TeamLineupPlayer[] = relationItems(source.players).map((item: any) => ({
    ...mapLineupMember(item),
    id: number(item.id),
    position_code: item.position_code ?? 'CM',
    x_percent: number(item.x_percent, 50),
    y_percent: number(item.y_percent, 50),
  }));

  return {
    team: {
      id: number(source.team?.id),
      name: source.team?.name ?? 'Komanda',
      logo_url: source.team?.logo_url ?? null,
    },
    format: source.format === '6v6' ? '6v6' : '5v5',
    players,
    bench: relationItems(source.bench).map(mapLineupMember),
  };
}

export function mapVenue(raw: any, index = 0): Venue {
  const source = raw?.stadium ?? raw?.data ?? raw ?? {};
  const location = source.location ?? {};
  const contact = source.contact ?? {};
  const formatItems = relationItems(source.formats);
  const photos: StadiumPhoto[] = relationItems(source.photos).map((item: any) => ({
    id: number(item.id),
    image_url: item.image_url ?? item.url ?? '',
    is_cover: Boolean(item.is_cover),
    sort_order: number(item.sort_order),
  }));
  const formats: StadiumFormat[] = formatItems.map((item: any) => ({
    id: number(item.id),
    format: (typeof item === 'string' ? item : item.format) as MatchFormat,
    length: item.length == null ? null : number(item.length),
    width: item.width == null ? null : number(item.width),
    is_available: item.is_available !== false,
  }));
  const id = number(source.id);

  return {
    id: String(id),
    numericId: id,
    name: source.name ?? 'Stadion',
    district: source.district ?? 'Bakı',
    address: source.address ?? null,
    formats: formats.filter((item) => item.is_available).map((item) => item.format),
    latitude: number(source.latitude ?? location.latitude),
    longitude: number(source.longitude ?? location.longitude),
    verificationRadius: number(source.verification_radius, 100),
    contactName: source.contact_name ?? contact.name ?? null,
    contactPhone: source.contact_phone ?? contact.phone ?? null,
    photos,
    accent: accents[(id + index) % accents.length],
    status: source.status ?? 'active',
    isVerified: Boolean(source.is_verified),
    raw: { ...source, formats },
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { dateLabel: value || 'Tarix yoxdur', time: '--:--' };
  return {
    dateLabel: new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'short' }).format(date),
    time: new Intl.DateTimeFormat('az-AZ', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date),
  };
}

export function mapMatch(raw: any): Match {
  const source = raw?.match ?? raw?.data ?? raw ?? {};
  const scheduledAt = source.scheduled_at ?? source.scheduledAt ?? '';
  const labels = formatDate(scheduledAt);
  const homeRaw = source.home_team ?? source.homeTeam ?? source.home ?? {};
  const awayRaw = source.away_team ?? source.awayTeam ?? source.away;
  const venueRaw = source.stadium ?? source.venue ?? {};
  return {
    id: String(source.id),
    numericId: number(source.id),
    home: mapTeam(homeRaw),
    away: awayRaw ? mapTeam(awayRaw) : null,
    format: source.format ?? '5v5',
    challengeType: source.challenge_type ?? 'direct',
    matchType: source.match_type ?? 'ranked',
    status: source.status ?? 'pending',
    scheduledAt,
    ...labels,
    durationMinutes: number(source.duration_minutes, 60),
    venue: mapVenue(venueRaw),
    ratingMin: source.rating_min ?? source.rating_range?.min ?? null,
    ratingMax: source.rating_max ?? source.rating_range?.max ?? null,
    notes: source.notes ?? null,
    cancellationReason: source.cancellation_reason ?? null,
    homeScore: source.home_score ?? source.result?.home_score,
    awayScore: source.away_score ?? source.result?.away_score,
    ratingDelta: source.rating_delta,
    raw,
  };
}

export function mapRoster(raw: any): MatchRoster {
  const source = raw?.data ?? raw ?? {};
  return {
    id: number(source.id),
    football_match_id: number(source.football_match_id),
    status: source.status ?? 'draft',
    format: source.format ?? '5v5',
    required_players: number(source.required_players, source.format === '6v6' ? 6 : 5),
    maximum_players: number(source.maximum_players, source.format === '6v6' ? 12 : 10),
    players_count: number(source.players_count, relationItems(source.players).length),
    has_minimum_players: Boolean(source.has_minimum_players),
    team: mapTeam(source.team),
    players: relationItems(source.players).map((item: any): MatchRosterPlayer => ({
      id: number(item.id),
      user_id: number(item.user_id),
      name: item.name ?? 'Oyunçu',
      avatar_url: item.avatar_url ?? null,
      added_at: item.added_at ?? null,
    })),
    submitted_at: source.submitted_at ?? null,
  };
}
