// Auth state: token yükle, kullanıcı getir, giriş/çıkış.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setToken, loadToken, getMe, authLogin, authRegister, becomeDev, acceptTerms } from '../api/client';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const t = await loadToken();
      if (!t) { setUser(null); return; }
      const u = await getMe();
      setUser(u);
    } catch {
      await setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => { await refresh(); setLoading(false); })();
  }, [refresh]);

  const login = async (name, password) => {
    const { token, user: u } = await authLogin(name, password);
    await setToken(token);
    setUser(u);
  };

  const register = async (name, password, email) => {
    const { token, user: u } = await authRegister(name, password, email);
    await setToken(token);
    setUser(u);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  const upgradeToDev = async () => {
    const u = await becomeDev();
    setUser(u);
  };

  const acceptTermsNow = async () => {
    const u = await acceptTerms();
    setUser(u);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, upgradeToDev, acceptTermsNow, refresh, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
