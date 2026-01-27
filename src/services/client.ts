import axios from "axios";

// src/services/client.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export type ApiTask = {
  _id: string;
  title: string;
  module: "listening" | "speaking" | "reading" | "writing";
  taskType: "multiple_choice" | "file_upload" | "video_response";
  instruction?: string;
  content?: string;
  mediaUrl?: string;
  questions: Array<{
    _id: string;
    question: string;
    options?: Array<{ id: string; text: string }>;
    correctAnswer?: string;
    points?: number;
    questionType?: "multiple_choice" | "text_input" | "file_upload";
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
  name: "listening" | "speaking" | "reading" | "writing";
  durationMinutes: number;
  bufferMinutes: number;
  taskIds: ApiTask[]; // Changed from empty array
};

export type Exam = {
  _id: string;
  title: string;
  level: string;
  modules: ExamModule[];
  totalMarks: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
};

export type MySubmission = {
  _id: string;
  studentId: string;
  examId: string;
  module: "listening" | "speaking" | "reading" | "writing";
  responses: Array<{
    taskId: string;
    questionId?: string;
    answer: string;
    score?: number;
    feedback?: string;
  }>;
  mediaUrls: string[];
  totalScore: number;
  status: "submitted" | "evaluated";
  reviewedBy?: string;
  createdAt: string;
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  private clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(method: string, endpoint: string, data?: any, isFormData = false): Promise<T> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      if (!isFormData && !(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }
      
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers,
        data: isFormData || data instanceof FormData ? data : JSON.stringify(data),
      };
      
      const response = await axios(config);
      
      // Handle your API response format { success: boolean, data: ... }
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Request failed');
        }
        return response.data.data as T;
      }
      
      // If response doesn't have success property, return as is
      return response.data as T;
    } catch (error: any) {
      console.error(`API Error ${method} ${endpoint}:`, error);
      
      // Handle 401 unauthorized
      if (error.response?.status === 401) {
        this.clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      // Throw a more descriptive error
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Request failed';
      throw new Error(errorMessage);
    }
  }

  // Get active exam for students
  async getExams(): Promise<Exam> {
    return this.request<Exam>("GET", "/api/exams");
  }

  // Get available exams (all active exams)
  async getAvailableExams(): Promise<Exam[]> {
    return this.request<Exam[]>("GET", "/api/exams");
  }

  // Get all exams (for teachers/admins)
  async getAllExams(): Promise<Exam[]> {
    return this.request<Exam[]>("GET", "/api/teacher/exams");
  }

  // Get specific exam by level
  async getExamByLevel(level: string): Promise<Exam> {
    return this.request<Exam>("GET", `/api/exams/${level}`);
  }

  // Start exam (get random questions)
  async startExam(level: string): Promise<any> {
    return this.request<any>("GET", `/api/exams/${level}/start`);
  }

  async fetchMySubmissions(): Promise<MySubmission[]> {
    return this.request<MySubmission[]>("GET", "/api/submissions/me");
  }

  async submitAnswers(payload: {
    examLevel: string;  // Changed from examId to examLevel
    module: "listening" | "speaking" | "reading" | "writing";
    responses: Array<{
      taskId: string;
      questionId?: string;
      answer: string;
    }>;
  }) {
    return this.request("POST", "/api/submissions", payload);
  }

  async submitMedia(formData: FormData) {
    return this.request("POST", "/api/submissions", formData, true);
  }

  // User profile methods
  async getUserDetails() {
    return this.request("GET", "/api/users/detail");
  }

  async createUserDetails(payload: {
    fullname: string;
    age: number;
    gender: string;
    motherTongue: Array<{ name: string }>;
    languagesKnown: Array<{ name: string }>;
    highestQualification: string;
    section?: string;
    residence: string;
  }) {
    return this.request("POST", "/api/users/create-detail", payload);
  }

  async login(payload: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>("POST", "/api/auth/login", payload);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(payload: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string;
  }) {
    const response = await this.request<{ token: string; user: any }>("POST", "/api/auth/register", payload);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request("GET", "/api/users/me");
  }

  // Payment methods
  async checkAccess() {
    return this.request("GET", "/api/payment/check-access");
  }

  // Teacher/Admin methods
  async getTeacherSubmissions(query?: {
    examId?: string;
    module?: string;
    status?: string;
  }) {
    const queryString = query ? `?${new URLSearchParams(query as any).toString()}` : '';
    return this.request("GET", `/api/teacher/submissions${queryString}`);
  }

  async reviewSubmission(submissionId: string, feedbacks: any[]) {
    return this.request("POST", `/api/teacher/submissions/${submissionId}/review`, { feedbacks });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);