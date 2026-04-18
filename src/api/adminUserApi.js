import { apiRequest } from './client.js';

export function createTeacherApi(payload) {
  return apiRequest('/admin/users/teachers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
