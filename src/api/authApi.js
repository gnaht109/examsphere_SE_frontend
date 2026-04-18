import { apiRequest } from './client.js';

export function loginApi({ username, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
