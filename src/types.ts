export type MatchFormat = '5v5' | '6v6';
export type ChallengeType = 'open' | 'direct';
export type MatchStatus =
  | 'open'
  | 'pending'
  | 'accepted'
  | 'rosters_ready'
  | 'rejected'
  | 'cancelled'
  | 'upcoming'
  | 'live'
  | 'verified'
  | 'completed';

export type ApiUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  phone_verified_at?: string | null;
  avatar_url?: string | null;
  role?: 'user' | 'super_admin' | string;
  username?: string | null;
  position?: string | null;
  district?: string | null;
  bio?: string | null;
  profile_completed_at?: string | null;
};

export type TeamMember = {
  id: number;
  user_id: number;
  role: 'captain' | 'co_captain' | 'player' | string;
  status: 'active' | 'pending' | 'left' | 'removed' | string;
  jersey_number?: number | null;
  joined_at?: string | null;
  user: ApiUser;
};

export type LineupPositionCode =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'DM'
  | 'CM'
  | 'AM'
  | 'LW'
  | 'RW'
  | 'ST';

export type TeamLineupMember = {
  team_member_id: number;
  role: TeamMember['role'];
  jersey_number?: number | null;
  user: ApiUser;
};

export type TeamLineupPlayer = TeamLineupMember & {
  id: number;
  position_code: LineupPositionCode;
  x_percent: number;
  y_percent: number;
};

export type TeamLineup = {
  team: {
    id: number;
    name: string;
    logo_url?: string | null;
  };
  format: MatchFormat;
  players: TeamLineupPlayer[];
  bench: TeamLineupMember[];
};

export type TeamLineupSavePlayer = {
  team_member_id: number;
  position_code: LineupPositionCode;
  x_percent: number;
  y_percent: number;
};

export type TeamRating = {
  format: MatchFormat;
  rating: number;
  wins: number;
  draws: number;
  losses: number;
  played: number;
  rank?: number | null;
};

export type Team = {
  id: string;
  numericId: number;
  name: string;
  handle: string;
  shortName?: string | null;
  logoUrl?: string | null;
  initials: string;
  district: string;
  formats: MatchFormat[];
  accent: string;
  rating5v5: number;
  rating6v6: number;
  trustScore: number;
  wins: number;
  draws: number;
  losses: number;
  form: Array<'W' | 'D' | 'L'>;
  rank: number;
  status: string;
  membersCount: number;
  inviteCode?: string | null;
  ownerUserId?: number | null;
  members: TeamMember[];
  ratings: TeamRating[];
  raw?: unknown;
};

export type StadiumPhoto = {
  id: number;
  image_url: string;
  is_cover: boolean;
  sort_order: number;
};

export type StadiumFormat = {
  id: number;
  format: MatchFormat;
  length?: number | null;
  width?: number | null;
  is_available: boolean;
};

export type Venue = {
  id: string;
  numericId: number;
  name: string;
  district: string;
  address?: string | null;
  formats: MatchFormat[];
  latitude: number;
  longitude: number;
  verificationRadius: number;
  contactName?: string | null;
  contactPhone?: string | null;
  photos: StadiumPhoto[];
  accent: string;
  status: string;
  isVerified: boolean;
  raw?: unknown;
};

export type Match = {
  id: string;
  numericId: number;
  home: Team;
  away: Team | null;
  format: MatchFormat;
  challengeType: ChallengeType;
  matchType: string;
  status: MatchStatus;
  scheduledAt: string;
  dateLabel: string;
  time: string;
  durationMinutes: number;
  venue: Venue;
  ratingMin?: number | null;
  ratingMax?: number | null;
  notes?: string | null;
  cancellationReason?: string | null;
  homeScore?: number;
  awayScore?: number;
  ratingDelta?: number;
  raw?: unknown;
};

export type MatchRosterPlayer = {
  id: number;
  user_id: number;
  name: string;
  avatar_url?: string | null;
  added_at?: string | null;
};

export type MatchRoster = {
  id: number;
  football_match_id: number;
  status: 'draft' | 'submitted' | string;
  format: MatchFormat;
  required_players: number;
  maximum_players: number;
  players_count: number;
  has_minimum_players: boolean;
  team: Team;
  players: MatchRosterPlayer[];
  submitted_at?: string | null;
};

export type Paginated<T> = {
  items: T[];
  currentPage?: number;
  lastPage?: number;
  total?: number;
};

export type OtpVerifyResponse = {
  message: string;
  is_new_user: boolean;
  user: ApiUser;
  token: string;
  type: string;
  expires_in: number;
};
