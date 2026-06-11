export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
};

export type ApiTask = {
  _id: string;
  title: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  taskType: 'multiple_choice' | 'file_upload' | 'video_response';
  instruction?: string;
  content?: string;
  mediaUrl?: string;
  questions: Array<{
    _id: string;
    question: string;
    options?: Array<{ id: string; text: string }>;
    correctAnswer?: string;
    points?: number;
    questionType?: 'multiple_choice' | 'text_input' | 'file_upload';
  }>;
  points?: number;
  durationMinutes?: number;
  maxFiles?: number;
  maxFileSize?: number;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
};

export type ExamModule = {
  name: 'listening' | 'speaking' | 'reading' | 'writing';
  durationMinutes: number;
  bufferMinutes: number;
  taskIds: ApiTask[];
};

export type Exam = {
  _id: string;
  title: string;
  level: string;
  modules: ExamModule[];
  totalMarks: number;
  isActive: boolean;
  price: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

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

  getToken() {
    return this.token;
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

      const data = await response.json();
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async register(userData: { name: string; email: string; password: string; role?: string }) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role: userData.role || 'student' }),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async verifyEmail(credentials: { email: string; otp: string }) {
    const response = await fetch(`${this.baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, otp: parseInt(credentials.otp) }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Verification failed');
    }
    
    const data = await response.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async resendOtp(email: string) {
    return this.request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/api/users/me');
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    return this.request('/api/exams');
  }

  async getExamByLevel(level: string): Promise<Exam> {
    return this.request(`/api/exams/${level}`);
  }



  // Payment
  async createOrder(amount: number, examId: string) {
    return this.request<{
      success: boolean;
      order: { id: string; amount: number; currency: string };
      key: string;
      message?: string;
    }>('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, examId }),
    });
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      examUnlocked: boolean;
    }>('/api/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async checkAccess() {
    return this.request<{
      success: boolean;
      hasAccess: boolean;
      needsPayment: boolean;
      completed: boolean;
      currentExam?: {
        examId: { _id: string; title: string; level: string };
        unlockedAt: string;
        expiresAt?: string;
      };
    }>('/api/payment/check-access');
  }

  async getPaymentStatus() {
    return this.request<{
      success: boolean;
      isAssessmentUnlocked: boolean;
      unlockedExams: Array<{
        examId: { _id: string; title: string; level: string };
        isCompleted?: boolean;
      }>;
    }>('/api/payment/status');
  }

  // Teacher/Admin - Tasks
  async createTask(taskData: {
    title: string;
    module: 'listening' | 'speaking' | 'reading' | 'writing';
    taskType: 'multiple_choice' | 'video_response' | 'file_upload';
    instruction: string;
    content?: string;
    mediaUrl?: string;
    questions: Array<{
      question: string;
      options?: Array<{ id: string; text: string }>;
      correctAnswer?: string;
      points: number;
      questionType: 'multiple_choice' | 'text_response' | 'file_upload' | 'video_response';
    }>;
    durationMinutes: number;
    points: number;
    isActive?: boolean;
  }) {
    return this.request('/api/teacher/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTasks(params?: { module?: string; taskType?: string; isActive?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.module) queryParams.append('module', params.module);
    if (params?.taskType) queryParams.append('taskType', params.taskType);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const url = queryParams.toString() ? `/api/teacher/tasks?${queryParams}` : '/api/teacher/tasks';
    return this.request<ApiTask[]>(url);
  }

  async updateTask(taskId: string, taskData: Partial<ApiTask>) {
    return this.request(`/api/teacher/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/api/teacher/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Teacher/Admin - Exams
  async createExam(examData: {
    title: string;
    level: string;
    price: number;
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

  async getTeacherExams(): Promise<Exam[]> {
    return this.request('/api/teacher/exams');
  }

  async toggleExamStatus(examId: string) {
    return this.request(`/api/exams/toggleExamStatus/${examId}`, { method: 'PUT' });
  }

  async deleteExam(examId: string) {
    return this.request(`/api/exams/delete/${examId}`, { method: 'DELETE' });
  }

  // Submissions
  async submitModule(formData: FormData) {
    const url = `${this.baseURL}/api/submissions`;
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Submission failed');
    }

    return response.json();
  }

  async getMySubmissions() {
    return this.request('/api/submissions/me');
  }

  async getTeacherSubmissions() {
    return this.request('/api/teacher/submissions');
  }

  async reviewSubmission(submissionId: string, feedbacks: any[]) {
    return this.request(`/api/teacher/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ feedbacks }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/admin/dashboard');
  }

  async getUsers() {
    return this.request('/api/admin/users');
  }

  async googleLogin(data: {
  email: string;
  name: string;
  token: string;
}) {
  const response = await fetch(`${this.baseURL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Google login failed');
  }

  const result = await response.json();

  if (result.token) {
    this.setToken(result.token);
  }

  return result;
}
}

export const apiClient = new ApiClient(API_BASE_URL);
