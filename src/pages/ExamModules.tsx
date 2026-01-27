import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../hooks/useExam';
import { useModuleSubmission } from '../hooks/useModuleSubmission';
import { Layout } from '../components/Layout';
import { 
  Headphones, 
  Mic, 
  PenTool, 
  BookOpen, 
  CheckCircle, 
  Play, 
  ArrowLeft,
  Award
} from 'lucide-react';
import { apiClient } from '../services/client';

export function ExamModules() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  
  // Pass level to useExam hook
  const { currentExam, loading: examLoading, error: examError } = useExam(level);
  
  // FIX: Use useMemo to prevent recreating moduleDefs on every render
  const moduleDefs = useMemo(() => {
    if (!currentExam || !currentExam.modulesWithTasks) return [];
    
    // Map your new exam structure to the expected format
    return currentExam.modulesWithTasks.map(module => ({
      name: module.moduleName,
      durationMinutes: module.durationMinutes,
      bufferMinutes: module.bufferMinutes,
      taskIds: module.availableTasks || [],
      maxQuestions: module.maxQuestions
    }));
  }, [currentExam]);
  
  const examId = currentExam?._id || '';

  
  // FIX: Only call useModuleSubmission if we have valid data
  const { 
    loading: subsLoading, 
    isSubmitted, 
    getModuleStatus, 
    getModuleDetails 
  } = useModuleSubmission(examId, moduleDefs);

  const [generatedExam, setGeneratedExam] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleStartExam = async () => {
    try {
      setLoadingQuestions(true);
      const response = await apiClient.startExam(level);
      if (response.success) {
        setGeneratedExam(response.data);
        localStorage.setItem(`exam_${level}_questions`, JSON.stringify(response.data));
        // Navigate to first module
        if (moduleDefs.length > 0) {
          navigate(`/exam/${level}/module/${moduleDefs[0]?.name}`);
        }
      }
    } catch (error) {
      console.error('Error starting exam:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // FIX: Add loading states
  if (examLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (examError || !currentExam) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
          <p className="text-gray-600 mb-6">
            {examError || `The "${level}" assessment could not be found.`}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const completedModules = moduleDefs.filter(module => isSubmitted(module.name)).length;
  const totalModules = moduleDefs.length;
  const progress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{currentExam.title}</h1>
            <p className="text-gray-600 mt-1">
              Level: {currentExam.level} • Total Marks: {currentExam.totalMarks || 0}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{progress}%</div>
            <div className="text-sm text-gray-600">
              {completedModules} of {totalModules} modules completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 rounded-full h-2">
          <div 
            className="bg-primary-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Start Exam Button */}
        {completedModules === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Start?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click "Start Assessment" to begin. You'll get randomized questions based on your level.
            </p>
            <button
              onClick={handleStartExam}
              disabled={loadingQuestions}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium text-lg flex items-center justify-center space-x-2 mx-auto"
            >
              {loadingQuestions ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Assessment</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Modules Grid */}
        {subsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading modules status...</p>
          </div>
        ) : moduleDefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moduleDefs.map((module, index) => {
              const submitted = isSubmitted(module.name);
              const moduleStatus = getModuleStatus(module.name);
              const moduleDetails = getModuleDetails(module.name);
              const moduleIcon = getModuleIcon(module.name);
              
              return (
                <div
                  key={module.name}
                  className={`rounded-xl p-6 border-2 transition-all ${
                    submitted
                      ? moduleStatus === 'evaluated'
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!submitted && generatedExam) {
                      navigate(`/exam/${level}/module/${module.name}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      submitted
                        ? moduleStatus === 'evaluated'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {submitted ? (
                        moduleStatus === 'evaluated' ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <CheckCircle className="w-6 h-6" />
                        )
                      ) : (
                        moduleIcon
                      )}
                    </div>
                    {submitted && moduleStatus === 'evaluated' && moduleDetails?.score && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {moduleDetails.score} pts
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 capitalize mb-2">
                    {module.name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-medium">{module.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tasks</span>
                      <span className="font-medium">{module.taskIds?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span className={`font-medium ${
                        submitted
                          ? moduleStatus === 'evaluated'
                            ? 'text-green-600'
                            : 'text-blue-600'
                          : 'text-gray-500'
                      }`}>
                        {submitted
                          ? moduleStatus === 'evaluated'
                            ? 'Evaluated'
                            : 'Submitted'
                          : 'Not Started'}
                      </span>
                    </div>
                  </div>

                  {!submitted ? (
                    <button
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/exam/${level}/module/${module.name}`);
                      }}
                    >
                      Start Module
                    </button>
                  ) : (
                    <button
                      className={`w-full py-2 rounded-lg font-medium ${
                        moduleStatus === 'evaluated'
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-blue-100 text-blue-700 cursor-default'
                      }`}
                      disabled
                    >
                      {moduleStatus === 'evaluated' ? 'Completed ✓' : 'Submitted'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Modules Available
            </h4>
            <p className="text-gray-600">
              This assessment doesn't have any modules configured yet.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const getModuleIcon = (name) => {
  switch (name?.toLowerCase()) {
    case "listening": return <Headphones className="w-6 h-6" />;
    case "speaking": return <Mic className="w-6 h-6" />;
    case "reading": return <BookOpen className="w-6 h-6" />;
    case "writing": return <PenTool className="w-6 h-6" />;
    default: return <Play className="w-6 h-6" />;
  }
};