import { apiRequest, unwrap, unwrapItems } from '@/src/api/client';
import { mapMatch, mapRoster, mapTeam, mapTeamLineup, mapUser, mapVenue } from '@/src/api/mappers';
import {
  ApiUser,
  ChallengeType,
  MatchFormat,
  OtpVerifyResponse,
  TeamLineupSavePlayer,
} from '@/src/types';

export const api = {
  auth: {
    register: (body: { name: string; email: string; password: string; password_confirmation: string }) =>
      apiRequest<any>('/auth/register', { method: 'POST', body, auth: false }),
    login: (body: { email: string; password: string }) =>
      apiRequest<any>('/auth/login', { method: 'POST', body, auth: false }),
    sendOtp: (phone: string) => apiRequest<any>('/auth/otp/send', {
      method: 'POST', body: { phone }, auth: false,
    }),
    verifyOtp: (body: { phone: string; otp: string; name?: string }) =>
      apiRequest<OtpVerifyResponse>('/auth/otp/verify', { method: 'POST', body, auth: false }),
    me: async () => mapUser(await apiRequest<any>('/auth/me')),
    logout: () => apiRequest<any>('/auth/logout', { method: 'POST' }),
    refresh: () => apiRequest<any>('/auth/refresh', { method: 'POST', retryOnUnauthorized: false }),
    updateAvatar: (avatar_url: string) => apiRequest<any>('/auth/avatar', {
      method: 'POST', body: { avatar_url },
    }),
    googleRedirectUrl: () => `${process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'}/auth/google/redirect`,
    githubRedirectUrl: () => `${process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'}/auth/github/redirect`,
  },

  profile: {
    show: async () => mapUser(await apiRequest<any>('/profile')),
    update: async (body: Partial<ApiUser>) => mapUser(await apiRequest<any>('/profile', {
      method: 'PATCH', body,
    })),
  },

  teams: {
    list: async () => unwrapItems(await apiRequest<any>('/teams')).map(mapTeam),
    mine: async () => unwrapItems(await apiRequest<any>('/teams/mine')).map(mapTeam),
    show: async (id: number | string) => mapTeam(await apiRequest<any>(`/teams/${id}`)),
    lineup: async (id: number | string, format: MatchFormat) => mapTeamLineup(
      await apiRequest<any>(`/teams/${id}/lineup?format=${encodeURIComponent(format)}`),
    ),
    saveLineup: async (
      id: number | string,
      format: MatchFormat,
      players: TeamLineupSavePlayer[],
    ) => mapTeamLineup(await apiRequest<any>(`/teams/${id}/lineup`, {
      method: 'PUT',
      body: { format, players },
    })),
    create: async (body: {
      name: string;
      handle: string;
      short_name?: string;
      district: string;
      formats: MatchFormat[];
    }) => mapTeam(await apiRequest<any>('/teams', { method: 'POST', body })),
    joinByCode: (invite_code: string) => apiRequest<any>('/teams/join-by-code', {
      method: 'POST', body: { invite_code },
    }),
  },

  stadiums: {
    list: async (district?: string) => unwrapItems(await apiRequest<any>(
      `/stadiums${district ? `?district=${encodeURIComponent(district)}` : ''}`,
    )).map(mapVenue),
    show: async (id: number | string) => mapVenue(await apiRequest<any>(`/stadiums/${id}`)),
    create: async (body: Record<string, unknown>) => mapVenue(await apiRequest<any>('/stadiums', {
      method: 'POST', body,
    })),
    addPhoto: (stadiumId: number, body: { image_url: string; is_cover?: boolean; sort_order?: number }) =>
      apiRequest<any>(`/stadiums/${stadiumId}/photos`, { method: 'POST', body }),
    deletePhoto: (photoId: number) => apiRequest<any>(`/stadiums/photos/${photoId}`, { method: 'DELETE' }),
    addFormat: (stadiumId: number, body: { format: MatchFormat; length: number; width: number }) =>
      apiRequest<any>(`/stadiums/${stadiumId}/formats`, { method: 'POST', body }),
    deleteFormat: (formatId: number) => apiRequest<any>(`/stadiums/formats/${formatId}`, { method: 'DELETE' }),
  },

  matches: {
    list: async (query = '') => unwrapItems(await apiRequest<any>(`/matches${query ? `?${query}` : ''}`)).map(mapMatch),
    open: async (format?: MatchFormat) => unwrapItems(await apiRequest<any>(
      `/matches/open${format ? `?format=${format}` : ''}`,
    )).map(mapMatch),
    mine: async () => unwrapItems(await apiRequest<any>('/matches/mine')).map(mapMatch),
    show: async (id: number | string) => mapMatch(await apiRequest<any>(`/matches/${id}`)),
    create: async (body: {
      home_team_id: number;
      away_team_id?: number;
      stadium_id: number;
      challenge_type: ChallengeType;
      format: MatchFormat;
      scheduled_at: string;
      duration_minutes: number;
      rating_min?: number;
      rating_max?: number;
      notes?: string;
    }) => mapMatch(await apiRequest<any>('/matches', { method: 'POST', body })),
    accept: (id: number, team_id: number) => apiRequest<any>(`/matches/${id}/accept`, {
      method: 'POST', body: { team_id },
    }),
    reject: (id: number, team_id: number) => apiRequest<any>(`/matches/${id}/reject`, {
      method: 'POST', body: { team_id },
    }),
    cancel: (id: number, reason?: string) => apiRequest<any>(`/matches/${id}/cancel`, {
      method: 'POST', body: { reason },
    }),
  },

  rosters: {
    list: async (matchId: number | string) =>
      unwrapItems(await apiRequest<any>(`/matches/${matchId}/rosters`)).map(mapRoster),
    update: async (matchId: number, teamId: number, player_ids: number[]) =>
      mapRoster(await apiRequest<any>(`/matches/${matchId}/rosters/${teamId}`, {
        method: 'PUT', body: { player_ids },
      })),
    submit: async (matchId: number, teamId: number) =>
      mapRoster(await apiRequest<any>(`/matches/${matchId}/rosters/${teamId}/submit`, { method: 'POST' })),
    reopen: async (matchId: number, teamId: number) =>
      mapRoster(await apiRequest<any>(`/matches/${matchId}/rosters/${teamId}/reopen`, { method: 'POST' })),
  },

  ai: {
    complete: (prompt: string) => apiRequest<any>('/ai/complete', { method: 'POST', body: { prompt } }),
  },
};
