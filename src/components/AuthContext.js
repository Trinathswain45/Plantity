"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("plantity_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      }
    } catch {}
  }, []);

  const saveAuth = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem("plantity_auth", JSON.stringify(payload));
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("plantity_auth");
  };

  const value = useMemo(() => ({
    user,
    token,
    showAuth,
    openAuth: () => setShowAuth(true),
    closeAuth: () => setShowAuth(false),
    saveAuth,
    signOut,
  }), [user, token, showAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
