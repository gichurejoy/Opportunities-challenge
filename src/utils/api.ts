/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState } from './localDb';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

const TOKEN_KEY = 'opportunities_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export const api = {
  async register(data: { email: string; password: string; name?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to register');
    authStorage.setToken(json.token);
    return json;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Invalid credentials');
    authStorage.setToken(json.token);
    return json;
  },

  async loginWithGoogle(idToken: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to sign in with Google');
    authStorage.setToken(json.token);
    return json;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) {
        authStorage.removeToken();
        return null;
      }
      const json = await res.json();
      return json.user;
    } catch {
      return null;
    }
  },

  async loadStateFromDb(): Promise<AppState | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const res = await fetchWithAuth('/api/state');
      if (!res.ok) return null;
      const json = await res.json();
      return json.state || null;
    } catch (err) {
      console.error('Failed to load state from database:', err);
      return null;
    }
  },

  async saveStateToDb(state: AppState): Promise<boolean> {
    const token = authStorage.getToken();
    if (!token) return false;
    try {
      const res = await fetchWithAuth('/api/state', {
        method: 'POST',
        body: JSON.stringify({ state }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save state to database:', err);
      return false;
    }
  }
};
