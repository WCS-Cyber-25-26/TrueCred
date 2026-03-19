"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = getCookie('user_info');
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  function login(token) {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    const userData = { sub: decoded.sub, role: decoded.role, email: decoded.email };
    setUser(userData);
    document.cookie = `user_info=${encodeURIComponent(JSON.stringify(userData))}; path=/; SameSite=Strict; Max-Age=${15 * 60}`;
    return userData;
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    document.cookie = 'user_info=; Max-Age=0; path=/';
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
