import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/client';

export const useModuleSubmission = (examId, modules = []) => {
  const [moduleProgress, setModuleProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiSubmissions, setApiSubmissions] = useState([]);
  
  // Use ref to prevent infinite re-renders
  const modulesRef = useRef(modules);

  const fetchSubmissions = useCallback(async () => {
    if (!examId) return [];
    
    try {
      const data = await apiClient.fetchMySubmissions();
      if (data.success) {
        // Filter submissions for this specific exam
        const examSubmissions = data.data.filter((sub) => 
          sub.examId?._id === examId
        );
        setApiSubmissions(examSubmissions);
        return examSubmissions;
      }
      return [];
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }
  }, [examId]);

  // Update module progress
  useEffect(() => {
    if (!examId || !modules || modules.length === 0) {
      setModuleProgress([]);
      return;
    }

    // Get local submission status
    const getLocalSubmissionStatus = () => {
      if (!examId) return {};
      try {
        const stored = localStorage.getItem(`exam_${examId}_submissions`);
        return stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.error("Error getting submission status:", error);
        return {};
      }
    };

    const localSubmissions = getLocalSubmissionStatus();
    
    const progress = modules.map(module => {
      const apiSubmitted = apiSubmissions.some(submission => 
        submission.module === module.name && 
        (submission.status === 'evaluated' || submission.status === 'submitted')
      );
      
      const localSubmitted = !!localSubmissions[module.name];
      const isCompleted = apiSubmitted || localSubmitted;
      
      const apiSubmission = apiSubmissions.find(sub => sub.module === module.name);
      const apiScore = apiSubmission?.totalScore || 0;
      const apiStatus = apiSubmission?.status || 'pending';

      return {
        name: module.name,
        completed: isCompleted,
        progress: isCompleted ? 100 : 0,
        score: apiScore,
        status: apiStatus !== 'pending' ? apiStatus : localSubmitted ? 'submitted' : 'pending',
        submittedAt: isCompleted ? new Date().toISOString() : undefined
      };
    });

    // Only update if changed
    setModuleProgress(prev => {
      if (JSON.stringify(prev) === JSON.stringify(progress)) {
        return prev;
      }
      return progress;
    });
  }, [examId, modules, apiSubmissions]);

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
  }, [examId, fetchSubmissions]);

  const isSubmitted = useCallback((moduleName) => {
    const module = moduleProgress.find(m => m.name === moduleName);
    return module?.completed || false;
  }, [moduleProgress]);

  const getModuleStatus = useCallback((moduleName) => {
    return moduleProgress.find(m => m.name === moduleName)?.status || 'pending';
  }, [moduleProgress]);

  const getModuleDetails = useCallback((moduleName) => {
    return moduleProgress.find(m => m.name === moduleName);
  }, [moduleProgress]);

  const markAsSubmitted = useCallback((moduleName) => {
    if (!examId) return false;

    try {
      const stored = localStorage.getItem(`exam_${examId}_submissions`);
      const submissions = stored ? JSON.parse(stored) : {};
      
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

  return {
    moduleProgress,
    loading,
    markAsSubmitted,
    isSubmitted,
    getModuleStatus,
    getModuleDetails,
    apiSubmissions,
    refreshSubmissions: fetchSubmissions,
  };
};