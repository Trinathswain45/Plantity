"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function decodeJwtExpiry(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const json = atob(padded);
    const data = JSON.parse(json);
    return typeof data.exp === "number" ? data.exp * 1000 : null;
  } catch {
    return null;
  }
}


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("plantity_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        const expiry = parsed.expiresAt || decodeJwtExpiry(parsed.token);
        if (expiry && Date.now() > expiry) {
          localStorage.removeItem("plantity_auth");
          setUser(null);
          setToken(null);
          return;
        }
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      }
    } catch {}
  }, []);

  const saveAuth = (payload) => {
    const expiresAt = payload.expiresAt || decodeJwtExpiry(payload.token);
    const toStore = { ...payload, expiresAt: expiresAt || null };
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem("plantity_auth", JSON.stringify(toStore));
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
