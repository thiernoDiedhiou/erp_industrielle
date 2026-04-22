const TOKEN_KEY = 'sa_token';

export function getSAToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSAToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeSAToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isSAAuthenticated(): boolean {
  const token = getSAToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.isSuperAdmin === true && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function getSAInfo(): { id: string; email: string; nom: string } | null {
  const token = getSAToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub, email: payload.email, nom: payload.nom };
  } catch {
    return null;
  }
}

export function logoutSA() {
  removeSAToken();
  window.location.href = '/super-admin/login';
}
