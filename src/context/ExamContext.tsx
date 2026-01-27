// contexts/ExamContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';


interface Module {
  moduleName: string;
  maxQuestions: number;
  durationMinutes: number;
}

interface Question {
  taskId: string;
  module: string;
  title: string;
  instruction: string;
  content?: string;
  mediaUrl?: string;
  durationMinutes: number;
  taskType: string;
  questions: Array<{
    question: string;
    options: Array<{ id: string; text: string }>;
    points: number;
    questionType: string;
  }>;
}

interface ExamDetails {
  examLevel: string;
  title: string;
  modules: Module[];
  questions: Question[];
  totalMarks: number;
  duration: number;
}

interface ExamWithAccess {
  exam: {
    _id: string;
    title: string;
    level: string;
  };
  hasAccess: boolean;
  hasUnlocked: boolean;
  isCompleted: boolean;
  needsPayment: boolean;
}

interface AccessStatus {
  success: boolean;
  canUnlockMore: boolean;
  maxConcurrentExams: number;
  currentExamCount: number;
  exams: ExamWithAccess[];
}

interface ExamState {
  currentExam: ExamDetails | null;
  accessStatus: AccessStatus | null;
  userLevel: string | null;
  loading: boolean;
  error: string | null;
}

type ExamAction =
  | { type: 'SET_EXAM'; payload: ExamDetails }
  | { type: 'SET_ACCESS_STATUS'; payload: AccessStatus }
  | { type: 'SET_USER_LEVEL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_EXAM_ACCESS'; payload: { examId: string; updates: Partial<ExamWithAccess> } }
  | { type: 'RESET' };

const initialState: ExamState = {
  currentExam: null,
  accessStatus: null,
  userLevel: null,
  loading: false,
  error: null,
};

const examReducer = (state: ExamState, action: ExamAction): ExamState => {
  switch (action.type) {
    case 'SET_EXAM':
      return { ...state, currentExam: action.payload, error: null };
    
    case 'SET_ACCESS_STATUS':
      return { ...state, accessStatus: action.payload, error: null };
    
    case 'SET_USER_LEVEL':
      return { ...state, userLevel: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'UPDATE_EXAM_ACCESS':
      if (!state.accessStatus) return state;
      
      const updatedExams = state.accessStatus.exams.map(exam => 
        exam.exam._id === action.payload.examId
          ? { ...exam, ...action.payload.updates }
          : exam
      );
      
      return {
        ...state,
        accessStatus: {
          ...state.accessStatus,
          exams: updatedExams,
        },
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

interface ExamContextType extends ExamState {
  setExamData: (exam: ExamDetails) => void;
  setAccessStatus: (status: AccessStatus) => void;
  setUserLevel: (level: string) => void;
  updateExamAccess: (examId: string, updates: Partial<ExamWithAccess>) => void;
  getExamAccess: (level: string) => ExamWithAccess | undefined;
  hasExamAccess: (level: string) => boolean;
  resetExamData: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(examReducer, initialState);

  const setExamData = (exam: ExamDetails) => {
    dispatch({ type: 'SET_EXAM', payload: exam });
  };

  const setAccessStatus = (status: AccessStatus) => {
    dispatch({ type: 'SET_ACCESS_STATUS', payload: status });
  };

  const setUserLevel = (level: string) => {
    dispatch({ type: 'SET_USER_LEVEL', payload: level });
  };

  const updateExamAccess = (examId: string, updates: Partial<ExamWithAccess>) => {
    dispatch({ type: 'UPDATE_EXAM_ACCESS', payload: { examId, updates } });
  };

  const getExamAccess = (level: string): ExamWithAccess | undefined => {
    if (!state.accessStatus?.exams) return undefined;
    return state.accessStatus.exams.find(
      exam => exam.exam.level.toLowerCase() === level.toLowerCase()
    );
  };

  const hasExamAccess = (level: string): boolean => {
    const examAccess = getExamAccess(level);
    return examAccess?.hasAccess || false;
  };

  const resetExamData = () => {
    dispatch({ type: 'RESET' });
  };

  const value = {
    ...state,
    setExamData,
    setAccessStatus,
    setUserLevel,
    updateExamAccess,
    getExamAccess,
    hasExamAccess,
    resetExamData,
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = (): ExamContextType => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};