'use client';

import { api } from './api';

export interface AuthUser {
  id: string;
  nom: string;
  email: string;
  role: string;
  tenant: {
    id: string;
    nom: string;
    slug: string;
    couleurPrimaire?: string;
    couleurSecondaire?: string;
    logo?: string;
  };
}

export async function login(email: string, password: string, tenantSlug: string) {
  const { data } = await api.post('/auth/login', { email, password, tenantSlug });

  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

export function logout() {
  api.post('/auth/logout').catch(() => {});
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}
