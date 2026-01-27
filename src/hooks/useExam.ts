import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../services/client";

export function useExam(level) {
  const [currentExam, setCurrentExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const fetchExam = useCallback(async (examLevel) => {
    try {
      setLoading(true);
      setErr(null);

      const apiExam = await apiClient.getExamByLevel(examLevel);
      
      if (!apiExam) {
        setCurrentExam(null);
        setErr(`No exam found for level: ${examLevel}`);
        return;
      }
      
      // Handle new exam structure with modulesWithTasks
      const processedExam = {
        ...apiExam,
        // Use modulesWithTasks if available, otherwise use empty array
        modules: apiExam.modulesWithTasks || apiExam.modules || []
      };
      
      setCurrentExam(processedExam);
      
    } catch (error) {
      console.error("Error fetching exam:", error);
      setErr(error.message || "Failed to load exam");
      setCurrentExam(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (level) {
      fetchExam(level);
    } else {
      setCurrentExam(null);
      setLoading(false);
    }
  }, [level, fetchExam]);

  return { 
    currentExam, 
    loading, 
    err,
    refreshExam: () => level && fetchExam(level)
  };
}