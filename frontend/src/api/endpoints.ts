import { api } from './client';
import type {
  AuthResponse,
  Comment,
  DashboardData,
  Provider,
  ProviderInput,
  Task,
  TaskFilters,
  TaskInput,
  User,
} from '../types';

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

// --- Users ---
export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  update: (id: string, data: Partial<Pick<User, 'name' | 'phone' | 'color'>>) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
};

// --- Providers ---
export const providersApi = {
  list: () => api.get<Provider[]>('/providers').then((r) => r.data),
  get: (id: string) => api.get<Provider>(`/providers/${id}`).then((r) => r.data),
  create: (data: ProviderInput) => api.post<Provider>('/providers', data).then((r) => r.data),
  update: (id: string, data: Partial<ProviderInput>) =>
    api.put<Provider>(`/providers/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/providers/${id}`),
};

// --- Tasks ---
export const tasksApi = {
  list: (filters: TaskFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== null),
    );
    return api.get<Task[]>('/tasks', { params }).then((r) => r.data);
  },
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: Partial<TaskInput>) => api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: string, data: Partial<TaskInput>) => api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/tasks/${id}`),
  addComment: (taskId: string, text: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { text }).then((r) => r.data),
  removeComment: (taskId: string, commentId: string) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

// --- Dashboard ---
export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard').then((r) => r.data),
};
