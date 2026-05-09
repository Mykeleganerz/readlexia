import apiClient from './api.service';
import { errorLogger, errorNotificationManager } from '../utils/errorLogger';

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    role?: string;
  };
  accessToken: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      errorLogger.info('Login attempt', { email });
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      errorLogger.info('Login successful', { userId: response.data.user.id });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      errorLogger.error(`Login failed: ${message}`, { email });
      throw error;
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      errorLogger.info('Registration attempt', { email, name });
      const response = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
      errorLogger.info('Registration successful', { userId: response.data.user.id });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      errorLogger.error(`Registration failed: ${message}`, { email, name });
      throw error;
    }
  },

  async getProfile(): Promise<ProfileResponse> {
    try {
      errorLogger.info('Fetching user profile');
      const response = await apiClient.get<ProfileResponse>('/auth/profile');
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      errorLogger.error(`Profile fetch failed: ${message}`);
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<{ message: string; resetToken?: string }> {
    try {
      errorLogger.info('Password reset requested', { email });
      const response = await apiClient.post('/auth/password/request-reset', { email });
      errorLogger.info('Password reset email sent', { email });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset request failed';
      errorLogger.error(`Password reset request failed: ${message}`, { email });
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      errorLogger.info('Attempting password reset');
      const response = await apiClient.post('/auth/password/reset', { token, newPassword });
      errorLogger.info('Password reset successful');
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      errorLogger.error(`Password reset failed: ${message}`);
      throw error;
    }
  },

  saveToken(token: string) {
    try {
      localStorage.setItem('accessToken', token);
      errorLogger.info('Access token saved');
    } catch (error) {
      errorLogger.error('Failed to save access token', { error: error instanceof Error ? error.message : 'Unknown' });
      errorNotificationManager.error('Failed to save authentication token');
    }
  },

  removeToken() {
    try {
      localStorage.removeItem('accessToken');
      errorLogger.info('Access token removed');
    } catch (error) {
      errorLogger.error('Failed to remove access token', { error: error instanceof Error ? error.message : 'Unknown' });
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      errorLogger.error('Failed to retrieve access token', { error: error instanceof Error ? error.message : 'Unknown' });
      return null;
    }
  },
};
