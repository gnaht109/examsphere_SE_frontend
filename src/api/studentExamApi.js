import { apiRequest } from './client.js';

export function getPublishedStudentExamsApi() {
  return apiRequest('/student/exams');
}

export function getPublishedStudentExamDetailApi(examId) {
  return apiRequest(`/student/exams/${examId}`);
}
