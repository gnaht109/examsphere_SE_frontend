// src/services/examService.js
const BASE_URL = 'http://localhost:8080/api'; // Replace with your actual URL

export const examService = {
  // Fetch all exams for the dashboard
  getAllExams: async () => {
    const response = await fetch(`${BASE_URL}/exams`);
    const result = await response.json();
    if (result.code === 1000) return result.data;
    throw new Error('Failed to fetch exams');
  },

  // Fetch a specific exam by ID
  getExamById: async (id) => {
    const response = await fetch(`${BASE_URL}/exams/${id}`);
    const result = await response.json();
    if (result.code === 1000) return result.data;
    throw new Error('Failed to fetch exam details');
  }
};