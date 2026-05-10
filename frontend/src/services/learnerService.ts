import { apiClient } from './apiClient';

export interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    category: string;
  };
  status: 'enrolled' | 'in-progress' | 'completed';
  progress: number;
  score?: number;
  totalQuestions?: number;
  enrolledAt: string;
}

export const learnerService = {
  enroll: async (courseId: string) => {
    return apiClient.post('/enrollments', { courseId });
  },

  getMyEnrollments: async (): Promise<Enrollment[]> => {
    return apiClient.get('/enrollments');
  },
  
  cancelEnrollment: async (enrollmentId: string) => {
    return apiClient.delete(`/enrollments/${enrollmentId}`);
  }
};
