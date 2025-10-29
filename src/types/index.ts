export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  progress?: {
            listening: string,
            speaking: string,
            reading: string,
            writing: string
        }
}


export interface TestModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'audio' | 'video' | 'text' | 'upload';
  question: string;
  options?: string[];
  correctAnswer?: string;
  audioUrl?: string;
  passage?: string;
  timeLimit?: number;
  points: number;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[];
  assignedStudents: string[];
}

export interface TestSubmission {
  id: string;
  userId: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  answers: any;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'reviewed';
  score?: number;
  feedback?: string;
  gradedBy?: string;
}

export interface TeacherCredentials {
  id: string;
  email: string;
  temporaryPassword: string;
  role: 'teacher' | 'admin';
  sentAt: string;
  isUsed: boolean;
}

export type ExamTask = {
  _id: string;
  module: "listening" | "speaking" | "reading" | "writing";
  type: "multiple-choice" | "audio" | "video" | "text" | "upload" | "text-or-upload";
  question: string;
  options?: string[];
  mediaUrl?: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  createdBy: string;
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
  level: "basic" | "intermediate" | "advanced" | string;
  modules: ExamModule[];
  totalMarks: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
};

export type MySubmission = {
  _id: string;
  studentId: string;
  examId: string;
  module: ExamModule["name"];
  responses: { taskId: string; answer: string; score: number }[];
  mediaUrls: string[];
  totalScore: number;
  status: "submitted" | "graded" | string;
  createdAt: string;
};
