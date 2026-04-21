const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const AUTH_STORAGE_KEY = 'examsphere_auth';

export function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function storeAuth(authData) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function apiRequest(path, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (auth?.token) {
    headers.Authorization = `${auth.type || 'Bearer'} ${auth.token}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(result?.message || 'The request failed.');
  }

  if (result.code !== 1000) {
    throw new Error(result.message || 'The request was not successful.');
  }

  return result.data;
}
