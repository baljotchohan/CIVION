import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const apiClient = {
  // Agents
  agents: {
    create: (data: any) => api.post('/api/v1/agents', data),
    list: (teamId: number) => api.get(`/api/v1/teams/${teamId}/agents`),
    get: (id: number) => api.get(`/api/v1/agents/${id}`),
    update: (id: number, data: any) => api.put(`/api/v1/agents/${id}`, data),
    delete: (id: number) => api.delete(`/api/v1/agents/${id}`),
    ask: (id: number, data: any) => api.post(`/api/v1/agents/${id}/ask`, data),
    activate: (id: number) => api.post(`/api/v1/agents/${id}/activate`),
    deactivate: (id: number) => api.post(`/api/v1/agents/${id}/deactivate`),
    memory: {
      get: (id: number) => api.get(`/api/v1/agents/${id}/memory`),
      add: (id: number, data: any) => api.post(`/api/v1/agents/${id}/memory`, data),
    },
  },

  // Conversations
  conversations: {
    list: (teamId: number) => api.get(`/api/v1/teams/${teamId}/conversations`),
    get: (id: number) => api.get(`/api/v1/conversations/${id}`),
    create: (data: any) => api.post('/api/v1/conversations', data),
    update: (id: number, data: any) => api.put(`/api/v1/conversations/${id}`, data),
    delete: (id: number) => api.delete(`/api/v1/conversations/${id}`),
    archive: (id: number) => api.post(`/api/v1/conversations/${id}/archive`),
  },

  // Debates
  debates: {
    list: (teamId: number) => api.get(`/api/v1/teams/${teamId}/debates`),
    get: (id: number) => api.get(`/api/v1/debates/${id}`),
    start: (teamId: number, data: any) => api.post(`/api/v1/teams/${teamId}/debate`, data),
  },

  // API Keys
  apiKeys: {
    list: () => api.get('/api/v1/api-keys'),
    save: (data: any) => api.post('/api/v1/api-keys', data),
  },
};

export default api;
