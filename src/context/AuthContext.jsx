import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearSession,
  getStoredUser,
  hasStoredSession,
  normalizeSessionOnBoot,
  registerUnauthorizedHandler,
  setSession,
} from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    normalizeSessionOnBoot();
    setIsAuthenticated(hasStoredSession());
    setUser(getStoredUser());
    setReady(true);

    registerUnauthorizedHandler((reason) => {
      setUser(null);
      setIsAuthenticated(false);
      if (reason === 'expired') setSessionExpired(true);
    });
    return () => registerUnauthorizedHandler(null);
  }, []);

  const login = useCallback((accessToken, userData, options) => {
    setSession(accessToken, userData, options);
    setUser(userData);
    setIsAuthenticated(true);
    setSessionExpired(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpired(false);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      isAuthenticated,
      user,
      login,
      logout,
      sessionExpired,
      clearSessionExpired,
    }),
    [ready, isAuthenticated, user, login, logout, sessionExpired, clearSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
