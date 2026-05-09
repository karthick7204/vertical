import { apiClient } from './apiClient';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillTags: string[];
}

export interface Assessment {
  _id: string;
  courseId: string;
  title: string;
  questions: Question[];
}

export const assessmentService = {
  getAssessmentByCourseId: async (courseId: string): Promise<Assessment> => {
    return apiClient.get(`/assessments/course/${courseId}`);
  },

  submitScore: async (courseId: string, score: number, totalQuestions: number) => {
    return apiClient.post('/assessments/score', { courseId, score, totalQuestions });
  }
};
