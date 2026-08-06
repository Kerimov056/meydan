import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'meydan.jwt';
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export const tokenStore = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return getWebStorage()?.getItem(TOKEN_KEY) ?? null;
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.setItem(TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

let refreshPromise: Promise<string | null> | null = null;

function errorMessage(payload: any, fallback: string) {
  if (typeof payload?.message === 'string') return payload.message;
  const firstErrors = payload?.errors && Object.values(payload.errors)[0];
  if (Array.isArray(firstErrors) && firstErrors[0]) return String(firstErrors[0]);
  return fallback;
}

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const oldToken = await tokenStore.get();
    if (!oldToken) return null;

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${oldToken}`,
      },
    });

    if (!response.ok) {
      await tokenStore.clear();
      return null;
    }

    const payload = await response.json();
    const token = payload?.token ?? payload?.access_token ?? payload?.data?.token;
    if (!token) return null;
    await tokenStore.set(token);
    return token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    auth = true,
    retryOnUnauthorized = true,
    headers: customHeaders,
    ...init
  } = options;

  const token = auth ? await tokenStore.get() : null;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = new Headers(customHeaders);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new ApiError('Server cavab vermədi. API ünvanını və şəbəkəni yoxlayın.', 0);
    }
    throw new ApiError('API ilə əlaqə qurulmadı. Laravel serverinin işlədiyini yoxlayın.', 0);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && auth && retryOnUnauthorized && path !== '/auth/refresh') {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const text = await response.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      errorMessage(payload, `Request uğursuz oldu (${response.status}).`),
      response.status,
      payload?.errors,
      payload,
    );
  }

  return payload as T;
}

export function getApiUrl() {
  return API_URL;
}

export function unwrap<T = any>(payload: any): T {
  if (payload?.data !== undefined && !Array.isArray(payload?.data?.data)) return payload.data as T;
  return payload as T;
}

export function unwrapItems<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.teams)) return payload.data.teams;
  if (Array.isArray(payload?.data?.stadiums)) return payload.data.stadiums;
  if (Array.isArray(payload?.data?.matches)) return payload.data.matches;
  if (Array.isArray(payload?.data?.rosters)) return payload.data.rosters;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.teams)) return payload.teams;
  if (Array.isArray(payload?.stadiums)) return payload.stadiums;
  if (Array.isArray(payload?.matches)) return payload.matches;
  if (Array.isArray(payload?.rosters)) return payload.rosters;
  return [];
}
