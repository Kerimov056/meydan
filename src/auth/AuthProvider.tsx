import { router } from 'expo-router';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from '@/src/api/endpoints';
import { tokenStore } from '@/src/api/client';
import { ApiUser } from '@/src/types';

type AuthContextValue = {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  authenticated: boolean;
  finishLogin: (token: string, user: ApiUser) => Promise<void>;
  reloadUser: () => Promise<ApiUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = useCallback(async () => {
    try {
      const current = await api.auth.me();
      setUser(current);
      return current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await tokenStore.get();
      setToken(stored);
      if (stored) {
        const current = await reloadUser();
        if (!current) {
          await tokenStore.clear();
          setToken(null);
        }
      }
      setLoading(false);
    })();
  }, [reloadUser]);

  const finishLogin = useCallback(async (nextToken: string, nextUser: ApiUser) => {
    await tokenStore.set(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Local session is cleared even when the server is unreachable.
    }
    await tokenStore.clear();
    setToken(null);
    setUser(null);
    router.replace('/');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    loading,
    authenticated: Boolean(token && user),
    finishLogin,
    reloadUser,
    logout,
  }), [finishLogin, loading, logout, reloadUser, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
