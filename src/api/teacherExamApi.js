import { apiRequest } from './client.js';

export function getMyExamsApi() {
  return apiRequest('/teacher/exams/my');
}

export function getTeacherExamDetailApi(examId) {
  return apiRequest(`/teacher/exams/${examId}`);
}

export function createTeacherExamApi(payload) {
  return apiRequest('/teacher/exams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTeacherExamApi(examId, payload) {
  return apiRequest(`/teacher/exams/${examId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTeacherExamApi(examId) {
  return apiRequest(`/teacher/exams/${examId}`, {
    method: 'DELETE',
  });
}

export function publishTeacherExamApi(examId) {
  return apiRequest(`/teacher/exams/${examId}/publish`, {
    method: 'PUT',
  });
}

export function addTeacherQuestionApi(examId, payload) {
  return apiRequest(`/teacher/exams/${examId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTeacherQuestionApi(examId, questionId, payload) {
  return apiRequest(`/teacher/exams/${examId}/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteTeacherQuestionApi(examId, questionId) {
  return apiRequest(`/teacher/exams/${examId}/questions/${questionId}`, {
    method: 'DELETE',
  });
}

export function createPassageApi(examId, payload) {
  return apiRequest(`/teacher/exams/${examId}/passages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePassageApi(passageId, payload) {
  return apiRequest(`/teacher/passages/${passageId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function addQuestionToPassageApi(passageId, payload) {
  return apiRequest(`/teacher/passages/${passageId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deletePassageApi(passageId) {
  return apiRequest(`/teacher/passages/${passageId}`, {
    method: 'DELETE',
  });
}
