import api from './client';
import {
  ApiResponse,
  AuthData,
  Task,
  TaskStats,
  TaskFilters,
  CreateTaskPayload,
  UpdateTaskPayload,
  User,
} from '../types';

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/login', data),

  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

export const tasksApi = {
  getAll: (filters?: TaskFilters) =>
    api.get<ApiResponse<{ tasks: Task[]; stats: TaskStats }>>('/tasks', { params: filters }),

  getById: (id: number) => api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`),

  create: (data: CreateTaskPayload) =>
    api.post<ApiResponse<{ task: Task }>>('/tasks', data),

  update: (id: number, data: UpdateTaskPayload) =>
    api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/tasks/${id}`),
};
