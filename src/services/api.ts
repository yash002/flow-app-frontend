'use client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class APIService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

const apiService = new APIService();

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface WorkflowComponent {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: string;
    config?: Record<string, unknown>;
  };
  style?: Record<string, unknown>;
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface ValidationWorkflow {
  components: WorkflowComponent[];
  connections: WorkflowConnection[];
}

interface Workflow {
  id?: string;
  name: string;
  description?: string;
  components: WorkflowComponent[]; 
  connections: WorkflowConnection[]; 
  configurations: object;
  createdAt?: string;
  updatedAt?: string;
}

interface ValidationResponse {
  valid: boolean;
  errors: string[];
}

interface User {
  id: string;
  email: string;
  role: string;
}

export const authAPI = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    apiService.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, password: string): Promise<RegisterResponse> =>
    apiService.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyToken: (): Promise<{ valid: boolean; user: User }> =>
    apiService.request('/auth/verify', {
      method: 'GET',
    }),
};

export const workflowAPI = {
  getAll: (): Promise<Workflow[]> => apiService.request('/workflows'),
  getOne: (id: string): Promise<Workflow> => apiService.request(`/workflows/${id}`),
  create: (workflow: Omit<Workflow, 'id'>): Promise<Workflow> => apiService.request('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow),
  }),
  update: (id: string, workflow: Partial<Workflow>): Promise<Workflow> => apiService.request(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workflow),
  }),
  delete: (id: string): Promise<void> => apiService.request(`/workflows/${id}`, {
    method: 'DELETE',
  }),
  validate: (workflow: ValidationWorkflow): Promise<ValidationResponse> => apiService.request('/workflows/validate', {
    method: 'POST',
    body: JSON.stringify(workflow),
  }),
};
