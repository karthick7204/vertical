import { apiClient } from './apiClient';

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'LEARNER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  organizationId?: string;
  accessToken: string;
}

export const authService = {
  async register(userData: any) {
    return apiClient.post('/auth/register', userData) as Promise<AuthResponse>;
  },

  async login(credentials: any) {
    return apiClient.post('/auth/login', credentials) as Promise<AuthResponse>;
  },

  async invite(inviteData: any) {
    return apiClient.post('/auth/invite', inviteData);
  },

  async activate(activationData: any) {
    return apiClient.post('/auth/activate', activationData) as Promise<AuthResponse>;
  },

  async logout() {
    return apiClient.post('/auth/logout', {});
  }
};
