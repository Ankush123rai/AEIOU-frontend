
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
        
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    return response.json();
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return response.json();
  }

  async googleLogin(googleData: { email: string; name: string; token?: string }) {
    const response = await fetch(`${this.baseURL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google login failed');
    }
    
    return response.json();
  }

  async emailVerify(credentials: { email: string; otp: number }) {
    const response = await fetch(`${this.baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Verification failed');
    }
    
    return response.json();
  }

  async getMe() {
    return this.request('/api/users/me');
  }

  async addTeacher(teacherData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.request('/api/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  }

  async getDashboardStats() {
    return this.request('/api/admin/dashboard');
  }

  async getUsers() {
    return this.request('/api/admin/users');
  }

  async createTask(taskData: {
    module: string;
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }) {
    return this.request('/api/teacher/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTasks(module?: string) {
    const query = module ? `?module=${module}` : '';
    return this.request(`/api/teacher/tasks${query}`);
  }

  async createExam(examData: {
    title: string;
    level: string;
    modules: Array<{
      name: string;
      durationMinutes: number;
      bufferMinutes: number;
      taskIds: string[];
    }>;
  }) {
    return this.request('/api/teacher/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async getExams() {
    return this.request('/api/teacher/exams');
  }

  async reviewSubmission(submissionId: string, reviewData: {
    score: number;
    feedback: string;
  }) {
    return this.request(`/api/teacher/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Student endpoints
  async getAvailableExams() {
    return this.request('/api/exams');
  }

  async fetchExams() {
    return this.request('/api/exams');
  }

  async submitModule(formData) {
    const url = `${this.baseURL}/api/submissions`;
    const headers = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Remove Content-Type for FormData to let browser set it with boundary
    const config = {
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
        
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async fetchMySubmissions() {
    return this.request('/api/submissions/me');
  }



  async healthCheck() {
    return this.request('/health');
  }

}

export const apiClient = new ApiClient(API_BASE_URL);

