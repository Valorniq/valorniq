import { auth } from './firebase';
import { runtimeConfig } from './runtimeConfig';

export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${runtimeConfig.apiBaseUrl}${path}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(apiUrl(path), { ...init, headers });
}
