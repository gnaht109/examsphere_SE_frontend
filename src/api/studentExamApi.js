import { apiRequest } from './client.js';

export function getPublishedStudentExamsApi() {
  return apiRequest('/student/exams');
}

export function getPublishedStudentExamDetailApi(examId) {
  return apiRequest(`/student/exams/${examId}`);
}

export function startStudentAttemptApi(examId) {
  return apiRequest(`/student/exams/${examId}/attempts`, {
    method: 'POST',
  });
}

export function getStudentAttemptApi(attemptId) {
  return apiRequest(`/student/attempts/${attemptId}`);
}

export function getStudentAttemptsApi(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest(`/student/attempts${query}`);
}

export function saveStudentAttemptAnswerApi(attemptId, payload) {
  return apiRequest(`/student/attempts/${attemptId}/answers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitStudentAttemptApi(attemptId) {
  return apiRequest(`/student/attempts/${attemptId}/submit`, {
    method: 'POST',
  });
}

export function getStudentAttemptResultApi(attemptId) {
  return apiRequest(`/student/attempts/${attemptId}/result`);
}
