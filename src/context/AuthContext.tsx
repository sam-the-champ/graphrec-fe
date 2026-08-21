import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth.api';
import { clearStoredToken, getStoredToken, onUnauthorized, setStoredToken } from '@/api/axios';
import type { LoginPayload, RegisterPayload } from '@/types/auth';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Starts true: on first load we don't yet know if a stored token is
  // still valid, so protected routes must wait for this to resolve
  // before deciding whether to redirect to /login.
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      // Token is invalid/expired — the axios 401 interceptor will also
      // fire and call logout(), but we clear defensively here too in
      // case the failure wasn't a 401 (e.g. network error on a stale
      // token scenario shouldn't leave stale user state hanging around).
      clearStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    onUnauthorized(() => {
      clearStoredToken();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, token } = await authApi.login(payload);
    setStoredToken(token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: registeredUser, token } = await authApi.register(payload);
    setStoredToken(token);
    setUser(registeredUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
