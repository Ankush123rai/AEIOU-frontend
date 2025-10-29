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
  taskIds: [];
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
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] =
        (headers as Record<string, string>)["Content-Type"] || "application/json";
    }

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      if (res.status === 401) {
        this.clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      let errText = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errText = errorData?.error || errorData?.message || errText;
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(errText);
    }

    if (res.status === 204) return {} as T;

    const responseData = await res.json();
    
    // Handle your API response format { success: boolean, data: ... }
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (!responseData.success) {
        throw new Error(responseData.message || 'Request failed');
      }
      return responseData.data as T;
    }
    
    return responseData as T;
  }

  // Get active exam (your API returns a single active exam)
  async getExams(): Promise<Exam> {
    return this.request<Exam>("/api/exams");
  }

  // Get all exams (for teachers/admins)
  async getAllExams(): Promise<Exam[]> {
    return this.request<Exam[]>("/api/teacher/exams");
  }

  async fetchMySubmissions(): Promise<MySubmission[]> {
    return this.request<MySubmission[]>("/api/submissions/me");
  }

  async submitAnswers(payload: {
    examId: string;
    module: ExamModule["name"];
    responses: Array<{
      taskId: string;
      questionId?: string;
      answer: string;
    }>;
  }) {
    return this.request("/api/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async submitMedia(formData: FormData) {
    return this.request("/api/submissions", {
      method: "POST",
      body: formData,
    });
  }

  // User profile methods
  async getUserDetails() {
    return this.request("/api/users/detail");
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
    return this.request("/api/users/create-detail", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
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
    const response = await this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request("/api/users/me");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);