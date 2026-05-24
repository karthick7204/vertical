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
  },

  async getCourseProgress(courseId: string) {
    return apiClient.get(`/courses/${courseId}/progress`);
  },

  async updateModuleProgress(courseId: string, moduleId: string, status: string, completionPercentage: number) {
    return apiClient.put(`/courses/${courseId}/progress/module/${moduleId}`, { status, completionPercentage });
  }
};
