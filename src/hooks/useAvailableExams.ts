import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../services/client";

export function useAvailableExams() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAvailableExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAvailableExams();
      
      if (Array.isArray(response)) {
        setExams(response);
        
        // Try to get previously selected exam from localStorage
        const savedExamId = localStorage.getItem('selectedExamId');
        if (savedExamId) {
          const savedExam = response.find((exam) => exam._id === savedExamId);
          if (savedExam) {
            setSelectedExam(savedExam);

          } else if (response.length > 0) {
            // Fallback to first available exam
            setSelectedExam(response[0]);
            localStorage.setItem('selectedExamId', response[0]._id);
          }
        } else if (response.length > 0) {
          // If no saved exam, select first available
          setSelectedExam(response[0]);
          localStorage.setItem('selectedExamId', response[0]._id);
        }
      } else if (response && typeof response === 'object') {
        // If response is a single exam object, wrap it in array
        setExams([response]);
        setSelectedExam(response);
        localStorage.setItem('selectedExamId', response._id);
      } else {
        setExams([]);
        setSelectedExam(null);
      }
      
    } catch (error) {
      console.error("Error fetching available exams:", error);
      setError(error.message);
      setExams([]);
      setSelectedExam(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectExam = useCallback((exam) => {
    setSelectedExam(exam);
    localStorage.setItem('selectedExamId', exam._id);
  }, []);

  const clearSelectedExam = useCallback(() => {
    setSelectedExam(null);
    localStorage.removeItem('selectedExamId');
  }, []);

  useEffect(() => {
    fetchAvailableExams();
  }, [fetchAvailableExams]);

  return {
    exams,
    selectedExam,
    loading,
    error,
    selectExam,
    clearSelectedExam,
    refreshExams: fetchAvailableExams,
  };
}