import { getPublishedStudentExamsApi, getPublishedStudentExamDetailApi } from '../api/studentExamApi.js';

export const examService = {
  getAllExams: async () => {
    return getPublishedStudentExamsApi();
  },

  getExamById: async (id) => {
    return getPublishedStudentExamDetailApi(id);
  },
};
