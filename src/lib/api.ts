import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  is_public: boolean;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Execution {
  id: string;
  workflow_id: string;
  status: string;
  steps: any[];
  input_data: any;
  output_data: any;
  error_message?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Workflows API
export const workflowsAPI = {
  getAll: async (): Promise<Workflow[]> => {
    const response = await api.get('/api/workflows/');
    return response.data;
  },

  getById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/api/workflows/${id}`);
    return response.data;
  },

  create: async (workflowData: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.post('/api/workflows/', workflowData);
    return response.data;
  },

  update: async (id: string, workflowData: Partial<Workflow>): Promise<Workflow> => {
    const response = await api.put(`/api/workflows/${id}`, workflowData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/workflows/${id}`);
  },
};

// Nodes API
export const nodesAPI = {
  getTypes: async () => {
    const response = await api.get('/api/nodes/types');
    return response.data;
  },

  createCustom: async (nodeData: any) => {
    const response = await api.post('/api/nodes/custom', nodeData);
    return response.data;
  },

  getCustomNodes: async () => {
    const response = await api.get('/api/nodes/custom');
    return response.data;
  },

  validateConfig: async (nodeConfig: any) => {
    const response = await api.post('/api/nodes/validate', nodeConfig);
    return response.data;
  },
};

// Execution API
export const executionAPI = {
  execute: async (workflowId: string, inputData: any = {}) => {
    const response = await api.post(`/api/execution/execute/${workflowId}`, inputData);
    return response.data;
  },

  getHistory: async (workflowId: string): Promise<Execution[]> => {
    const response = await api.get(`/api/execution/history/${workflowId}`);
    return response.data;
  },

  createWebSocket: (workflowId: string) => {
    const token = localStorage.getItem('auth-token');
    const wsUrl = `ws://localhost:8000/api/execution/ws/${workflowId}`;
    return new WebSocket(wsUrl);
  },
};

export default api;