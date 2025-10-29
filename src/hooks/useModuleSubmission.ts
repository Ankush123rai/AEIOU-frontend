import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

interface SubmissionStatus {
  [moduleName: string]: boolean;
}

interface ModuleProgress {
  name: string;
  completed: boolean;
  progress: number;
  submittedAt?: string;
  score?: number;
  status?: string;
}

interface ApiSubmission {
  _id: string;
  studentId: string;
  examId: {
    _id: string;
    title: string;
    modules: Array<{
      name: string;
      durationMinutes: number;
      bufferMinutes: number;
      taskIds: string[];
    }>;
  };
  module: string;
  responses: Array<{
    taskId: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
  totalScore: number;
  status: 'pending' | 'evaluated' | 'submitted';
  createdAt: string;
}

export const useModuleSubmission = (examId?: string, modules: any[] = []) => {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiSubmissions, setApiSubmissions] = useState<ApiSubmission[]>([]);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    if (!examId) return [];
    
    try {
      const data = await apiClient.fetchMySubmissions();
      if (data.success) {
        setApiSubmissions(data.data || []);
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }
  }, [examId]);

  const markAsSubmitted = useCallback((moduleName: string): boolean => {
    if (!examId) return false;

    try {
      const stored = localStorage.getItem(`exam_${examId}_submissions`);
      const submissions: SubmissionStatus = stored ? JSON.parse(stored) : {};
      
      submissions[moduleName] = true;
      localStorage.setItem(`exam_${examId}_submissions`, JSON.stringify(submissions));
      
      setModuleProgress(prev => 
        prev.map(module => 
          module.name === moduleName 
            ? { ...module, completed: true, progress: 100 }
            : module
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error marking module as submitted:", error);
      return false;
    }
  }, [examId]);

  const getSubmissionStatus = useCallback((): SubmissionStatus => {
    if (!examId) return {};
    
    try {
      const stored = localStorage.getItem(`exam_${examId}_submissions`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Error getting submission status:", error);
      return {};
    }
  }, [examId]);

  const clearSubmissions = useCallback((): void => {
    if (!examId) return;
    localStorage.removeItem(`exam_${examId}_submissions`);
    setModuleProgress(prev => 
      prev.map(module => ({ ...module, completed: false, progress: 0 }))
    );
  }, [examId]);

  // Check if module is submitted via API
  const isModuleSubmittedInApi = useCallback((moduleName: string): boolean => {
    return apiSubmissions.some(submission => 
      submission.module === moduleName && 
      (submission.status === 'evaluated' || submission.status === 'submitted')
    );
  }, [apiSubmissions]);

  // Get module score from API
  const getModuleScore = useCallback((moduleName: string): number => {
    const submission = apiSubmissions.find(sub => sub.module === moduleName);
    return submission?.totalScore || 0;
  }, [apiSubmissions]);

  // Get module status from API
  const getModuleStatusFromApi = useCallback((moduleName: string): string => {
    const submission = apiSubmissions.find(sub => sub.module === moduleName);
    return submission?.status || 'pending';
  }, [apiSubmissions]);

  useEffect(() => {
    if (!examId || !modules || modules.length === 0) return;

    
    const submissions = getSubmissionStatus();
    
    const progress = modules.map(module => {
      const apiSubmitted = isModuleSubmittedInApi(module.name);
      const localSubmitted = !!submissions[module.name];
      const isCompleted = apiSubmitted || localSubmitted;
      const apiScore = getModuleScore(module.name);
      const apiStatus = getModuleStatusFromApi(module.name);


      return {
        name: module.name,
        completed: isCompleted,
        progress: isCompleted ? 100 : 0,
        score: apiScore,
        status: apiStatus !== 'pending' ? apiStatus : localSubmitted ? 'submitted' : 'pending',
        submittedAt: isCompleted ? new Date().toISOString() : undefined
      };
    });

    setModuleProgress(progress);
  }, [apiSubmissions, examId, modules, getSubmissionStatus, isModuleSubmittedInApi, getModuleScore, getModuleStatusFromApi]);

  // Initial data loading
  useEffect(() => {
    if (!examId || !modules || modules.length === 0) {
      setModuleProgress([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await fetchSubmissions();
      } catch (error) {
        console.error("Error loading submissions:", error);
        setModuleProgress([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, modules, fetchSubmissions]);

  const isSubmitted = useCallback((moduleName: string): boolean => {
    const submitted = moduleProgress?.find(m => m.name === moduleName)?.completed || false;
    return submitted;
  }, [moduleProgress]);

  const getModuleStatus = useCallback((moduleName: string) => {
    return moduleProgress?.find(m => m.name === moduleName)?.status || 'pending';
  }, [moduleProgress]);

  const getModuleDetails = useCallback((moduleName: string) => {
    return moduleProgress?.find(m => m.name === moduleName);
  }, [moduleProgress]);

  return {
    moduleProgress: moduleProgress || [],
    loading,
    markAsSubmitted,
    getSubmissionStatus,
    clearSubmissions,
    isSubmitted,
    getModuleStatus,
    getModuleDetails,
    apiSubmissions,
    refreshSubmissions: fetchSubmissions,
  };
};

export type { SubmissionStatus, ModuleProgress, ApiSubmission }