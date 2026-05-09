import axios from 'axios';
import { errorNotificationManager, errorLogger } from '../utils/errorLogger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    errorLogger.error('Request interceptor error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Unauthorized - clear token and redirect to login
      errorLogger.warn('Unauthorized access - clearing token', { url: error.config?.url });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      errorNotificationManager.error('Your session has expired. Please log in again.');

      // Prevent redirect loop if already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      errorLogger.warn('Access forbidden', { url: error.config?.url });
      errorNotificationManager.error('You do not have permission to access this resource.');
    } else if (error.response?.status === 404) {
      errorLogger.warn('Resource not found', { url: error.config?.url });
      errorNotificationManager.error('The requested resource was not found.');
    } else if (error.response?.status === 429) {
      errorLogger.warn('Rate limit exceeded', { url: error.config?.url });
      errorNotificationManager.error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status >= 500) {
      errorLogger.error('Server error', { status: error.response.status, url: error.config?.url });
      errorNotificationManager.error('A server error occurred. Please try again later.');
    } else if (error.code === 'ECONNABORTED' || error.message === 'timeout of 10000ms exceeded') {
      errorLogger.error('Request timeout', { url: error.config?.url });
      errorNotificationManager.error('The request took too long. Please try again.');
    } else if (!error.response) {
      errorLogger.error('Network error', { message: error.message });
      errorNotificationManager.error('Unable to connect to the server. Please check your internet connection.');
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
