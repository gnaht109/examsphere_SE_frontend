import { apiRequest } from './client.js';

export function loginApi({ username, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function signupApi(payload) {
  return apiRequest('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
