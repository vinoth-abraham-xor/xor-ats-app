import axios from 'axios';
import type { User, BenchResource, JobRequirement } from '@/types';

// API Base Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// User Services
export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  create: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },
  update: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

// Bench Resource Services
export const benchResourceService = {
  getAll: async (): Promise<BenchResource[]> => {
    const response = await apiClient.get('/bench-resources');
    return response.data;
  },
  getById: async (id: string): Promise<BenchResource> => {
    const response = await apiClient.get(`/bench-resources/${id}`);
    return response.data;
  },
  create: async (
    resource: Omit<BenchResource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BenchResource> => {
    const response = await apiClient.post('/bench-resources', resource);
    return response.data;
  },
  update: async (id: string, resource: Partial<BenchResource>): Promise<BenchResource> => {
    const response = await apiClient.put(`/bench-resources/${id}`, resource);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bench-resources/${id}`);
  },
};

// Job Requirement Services
export const jobRequirementService = {
  getAll: async (): Promise<JobRequirement[]> => {
    const response = await apiClient.get('/job-requirements');
    return response.data;
  },
  getById: async (id: string): Promise<JobRequirement> => {
    const response = await apiClient.get(`/job-requirements/${id}`);
    return response.data;
  },
  create: async (
    requirement: Omit<JobRequirement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JobRequirement> => {
    const response = await apiClient.post('/job-requirements', requirement);
    return response.data;
  },
  update: async (id: string, requirement: Partial<JobRequirement>): Promise<JobRequirement> => {
    const response = await apiClient.put(`/job-requirements/${id}`, requirement);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/job-requirements/${id}`);
  },
};

export default apiClient;
