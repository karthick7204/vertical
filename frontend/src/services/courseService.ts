import { apiClient } from './apiClient';

export const courseService = {
  async createCourse(courseData: any) {
    return apiClient.post('/courses', courseData);
  },

  async getAllCourses() {
    return apiClient.get('/courses');
  },

  async getCourseById(id: string) {
    return apiClient.get(`/courses/${id}`);
  },

  async updateCourse(id: string, courseData: any) {
    return apiClient.put(`/courses/${id}`, courseData);
  },

  async deleteCourse(id: string) {
    return apiClient.delete(`/courses/${id}`);
  }
};
