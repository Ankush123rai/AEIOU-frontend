import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  CheckCircle,
  Play,
  Award,
  AlertCircle,
  Eye,
  BarChart,
  Clock as ClockIcon,
  Sparkles,
  Target,
  ChevronRight,
  Copyright,
  ExternalLink,
  FileText,
  Lock,
  Trophy,
  Download,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { httpClient } from "../api/httpClient";
import { useExam } from "../context/ExamContext";
import { Layout } from "../components/Layout";

export default function Exam() {
  const { setExamData, setAccessStatus, getExamAccess, hasExamAccess } = useExam();
  const navigate = useNavigate();
  const { level } = useParams();
  const queryClient = useQueryClient();
  
  const [submissionResults, setSubmissionResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';

  // Fetch exam data
  const {
    data: examData,
    isLoading: isExamLoading,
    error: examError,
  } = useQuery({
    queryKey: ["exam", level],
    queryFn: async () => {
      const response = await httpClient.get(`exams/${formattedLevel}/start`);
      // Store exam data in context
      if (response.data) {
        setExamData(response.data);
      }
      return response;
    },
    enabled: !!level,
  });

  const {
    data: accessData,
    isLoading: isAccessLoading,
    error: accessError,
  } = useQuery({
    queryKey: ["exam-access", level],
    queryFn: async () => {
      const response = await httpClient.get("payment/check-access");
      if (response) {
        setAccessStatus(response);
      }
      return response;
    },
  });

  // Fetch submission results for this exam level
  const { data: submissionsData } = useQuery({
    queryKey: ["exam-submissions", level],
    queryFn: async () => {
      try {
        const response = await httpClient.get(`submissions/me/${formattedLevel}`);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
      }
    },
    enabled: !!level && !!accessData, // Only fetch if we have access data
  });

  useEffect(() => {
    if (submissionsData) {
      setSubmissionResults(submissionsData);
      
      // Check if exam is completed (all 4 modules have submissions)
      const submittedModules = submissionsData.map(s => s.module.toLowerCase());
      const allModules = ["listening", "speaking", "reading", "writing"];
      const isAllModulesSubmitted = allModules.every(module => 
        submittedModules.includes(module.toLowerCase())
      );
      
      setExamCompleted(isAllModulesSubmitted);
    }
  }, [submissionsData]);

  const startExamMutation = useMutation({
    mutationFn: async () => {
      return await httpClient.post(`exam/${formattedLevel}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["exam", level]);
      navigate(`/exam/${level}/module/listening`);
    },
    onError: (error) => {
      console.error("Failed to start exam:", error);
    },
  });

  // Get current exam access from context
  const currentExamAccess = getExamAccess(level || '');

  // Extract data
  const examDetails = examData?.data;
  const selectedExam = examDetails ? {
    _id: examDetails._id,
    title: examDetails.title,
    level: examDetails.examLevel,
    totalMarks: examDetails.totalMarks,
    modules: examDetails.modules,
    duration: examDetails.duration,
    questions: examDetails.questions,
  } : null;

  const hasAccess = currentExamAccess?.hasAccess || false;
  const needsPayment = currentExamAccess?.needsPayment || false;

  const moduleDefs = useMemo(() => selectedExam?.modules || [], [selectedExam]);

  // Calculate module statistics
  const getModuleTaskCount = (module) => {
    if (!selectedExam?.questions) return 0;
    return selectedExam.questions.filter(
      (question) => question.module === module.moduleName
    ).length;
  };

  const getModuleQuestionCount = (module) => {
    if (!selectedExam?.questions) return 0;
    
    const moduleQuestions = selectedExam.questions.filter(
      (question) => question.module === module.moduleName
    );
    
    let totalQuestions = 0;
    
    if (module.moduleName === 'listening' || module.moduleName === 'reading') {
      moduleQuestions.forEach((task) => {
        if (task.questions && task.questions.length > 0) {
          totalQuestions += task.questions.length;
        } else {
          totalQuestions += 1;
        }
      });
    } else {
      totalQuestions = moduleQuestions.length;
    }
    
    return totalQuestions;
  };

  // Get module submission status
  const getModuleSubmissionStatus = (moduleName) => {
    const moduleSubmission = submissionResults.find(
      (submission) => submission.module.toLowerCase() === moduleName.toLowerCase()
    );
    
    if (!moduleSubmission) return null;
    
    // Calculate max score for this module
    const maxScore = moduleSubmission.responses.reduce((acc, response) => 
      acc + (response.maxScore || 5), 0
    );
    
    const percentage = maxScore > 0 
      ? Math.round((moduleSubmission.totalScore / maxScore) * 100) 
      : 0;
    
    return {
      isSubmitted: true,
      isEvaluated: moduleSubmission.status === 'evaluated',
      score: moduleSubmission.totalScore,
      maxScore: maxScore,
      percentage: percentage,
      status: moduleSubmission.status,
      submissionDate: moduleSubmission.createdAt,
      submissionId: moduleSubmission._id,
    };
  };

  // Calculate overall exam statistics
  const getOverallExamStats = () => {
    if (submissionResults.length === 0) return null;
    
    const totalScore = submissionResults.reduce((acc, curr) => acc + curr.totalScore, 0);
    const totalPossibleScore = submissionResults.reduce((acc, curr) => {
      return acc + curr.responses.reduce((sum, response) => sum + (response.maxScore || 5), 0);
    }, 0);
    
    const percentage = totalPossibleScore > 0 
      ? Math.round((totalScore / totalPossibleScore) * 100) 
      : 0;
    
    const submittedModules = submissionResults.length;
    const evaluatedModules = submissionResults.filter(r => r.status === 'evaluated').length;
    const pendingModules = submissionResults.filter(r => r.status === 'submitted').length;
    
    return {
      totalScore,
      totalPossibleScore,
      percentage,
      submittedModules,
      evaluatedModules,
      pendingModules,
      allEvaluated: evaluatedModules === moduleDefs.length,
    };
  };

  const overallStats = getOverallExamStats();

  const handleStartExam = () => {
    if (!hasAccess) {
      // Show payment or activation modal
      return;
    }
    if (examCompleted) {
      // Navigate to results page
      navigate(`/results/${level}`);
      return;
    }
    startExamMutation.mutate();
  };

  const handleModuleStart = (moduleName) => {
    if (!hasAccess) {
      return;
    }
    
    // If exam is completed, navigate to results instead
    if (examCompleted) {
      navigate(`/results/${level}`, { 
        state: { 
          scrollToModule: moduleName.toLowerCase(),
        } 
      });
      return;
    }
    
    // Check if this module is already submitted
    const moduleStatus = getModuleSubmissionStatus(moduleName);
    if (moduleStatus?.isSubmitted) {
      // Navigate to results for this specific module
      navigate(`/results/${level}`, { 
        state: { 
          scrollToModule: moduleName.toLowerCase(),
        } 
      });
      return;
    }
    
    // Start the module
    navigate(`/exam/${level}/module/${moduleName}`);
  };

  const handleViewResults = () => {
    navigate(`/results/${level}`);
  };

  // Get module display name
  const getModuleDisplayName = (moduleName) => {
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  };

  // Loading state
  if (isExamLoading || isAccessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col">
            <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
              <span className="text-orange-500">AE</span>
              <span className="text-blue-600">I</span>
              <img
                className="sm:w-7 sm:h-7 w-4 h-4"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                alt="india"
              />
              <span className="text-green-500">O</span>
              <span className="text-green-500">U</span>
              <Copyright className="p-1 relative bottom-2 right-1" />
            </div>
            <span className="sm:text-xs text-[8px] font-medium">
              Assessment Of English In Our Union
            </span>
          </div>
          <p className="mt-4 text-gray-200 font-medium">
            Loading exam data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (examError || accessError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Failed to load exam</h3>
          <p className="text-gray-200 mb-6">
            {examError?.message || accessError?.message || "Please try again later"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl transition-all duration-300"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedExam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Exam Not Available</h3>
          <p className="text-gray-200 mb-6">
            The requested exam is not available. Please select a different level.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen text-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedExam.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-full text-sm font-medium">
                      <Target className="w-3 h-3" />
                      Level: {selectedExam.level}
                    </span>
                    <span className="text-sm text-gray-200">
                      Total Marks: {selectedExam.totalMarks}
                    </span>
                    <span className="text-sm text-gray-200">
                      Duration: {selectedExam.duration} mins
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Access Status */}
              <div className="flex items-center gap-3">
                {hasAccess ? (
                  examCompleted ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 backdrop-blur-sm rounded-full border border-green-500/20">
                      <Trophy className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Completed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 backdrop-blur-sm rounded-full border border-blue-500/20">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">In Progress</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 backdrop-blur-sm rounded-full border border-red-500/20">
                    <Lock className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">
                      {needsPayment ? 'Purchase Required' : 'No Access'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Exam Status Info */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Overview</h3>
                  <p className="text-gray-900">
                    Complete all 4 modules to finish this assessment. Each module focuses on different language skills.
                  </p>
                  {examCompleted && overallStats && (
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-900">Overall Score</div>
                        <div className="text-xl font-bold text-primary-600">
                          {overallStats.totalScore}/{overallStats.totalPossibleScore} 
                          <span className="text-lg text-gray-800 ml-2">({overallStats.percentage}%)</span>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-900">Modules Completed</div>
                        <div className="text-xl font-bold text-primary-600">
                          {overallStats.submittedModules}/{moduleDefs.length}
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-900">Evaluated</div>
                        <div className="text-xl font-bold text-primary-600">
                          {overallStats.evaluatedModules}/{moduleDefs.length}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {hasAccess && (
                  <button
                    onClick={handleStartExam}
                    disabled={startExamMutation.isLoading}
                    className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      examCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    {examCompleted ? (
                      <>
                        <FileText className="w-5 h-5" />
                        View Results
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Full Exam
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
              {examCompleted && overallStats && (
                <div className="flex items-center gap-2 text-sm text-gray-800">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All {moduleDefs.length} modules completed</span>
                </div>
              )}
            </div>
            
            {moduleDefs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {moduleDefs.map((module, index) => {
                  const totalTasks = getModuleTaskCount(module);
                  const totalQuestions = getModuleQuestionCount(module);
                  const moduleIcon = getModuleIcon(module.moduleName);
                  const moduleColor = getModuleColor(module.moduleName);
                  const moduleStatus = getModuleSubmissionStatus(module.moduleName);
                  const isModuleSubmitted = moduleStatus !== null;
                  const isModuleCompleted = isModuleSubmitted;
                  const isModuleAccessible = hasAccess;

                  return (
                    <div
                      key={module.moduleName}
                      className={`group relative bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                        !hasAccess 
                          ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                          : isModuleCompleted
                          ? 'border-green-200 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700/50 cursor-pointer'
                          : 'border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 cursor-pointer'
                      }`}
                      onClick={() => hasAccess && handleModuleStart(module.moduleName)}
                    >
                      {/* Module Header with Status Badge */}
                      <div className="relative">
                        <div className={`p-6 ${moduleColor} relative`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center`}>
                              {React.cloneElement(moduleIcon, { className: `w-6 h-6 text-white` })}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-white/90">Tasks</div>
                              <div className="text-lg font-bold text-white">{totalTasks}</div>
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-white capitalize mb-2">
                            {getModuleDisplayName(module.moduleName)}
                          </h3>
                          <p className="text-sm text-white/90">
                            {totalQuestions} questions • {module.durationMinutes} minutes
                          </p>
                        </div>

                        {/* Score Display for Completed Modules */}
                        {isModuleSubmitted && moduleStatus && (
                          <div className="px-6 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-200">Your Score</span>
                              <span className={`text-lg font-bold ${
                                moduleStatus.percentage >= 70 
                                  ? 'text-green-600 dark:text-green-400'
                                  : moduleStatus.percentage >= 50
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {moduleStatus.score}/{moduleStatus.maxScore} ({moduleStatus.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  moduleStatus.percentage >= 70 
                                    ? 'bg-green-500'
                                    : moduleStatus.percentage >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(moduleStatus.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        {!hasAccess ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-200">Access Required</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-md"
                            >
                              Purchase Access
                            </button>
                          </div>
                        ) : isModuleSubmitted ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-200">Status:</span>
                              <span className={`font-medium ${
                                moduleStatus.isEvaluated 
                                  ? 'text-green-600'
                                  : 'text-yellow-600'
                              }`}>
                                {moduleStatus.isEvaluated ? 'Evaluated' : 'Under Review'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-200">Submitted:</span>
                              <span className="font-medium text-gray-400">
                                {new Date(moduleStatus.submissionDate).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModuleStart(module.moduleName);
                              }}
                              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleModuleStart(module.moduleName);
                            }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Module</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Modules Available</h3>
                <p className="text-gray-200 max-w-md mx-auto">
                  This assessment doesn't have any modules configured yet.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 border-2 border-gray-300 font-medium rounded-xl transition-all duration-300"
            >
              Back to Dashboard
            </button>
            
            
          </div>
        </div>
      </div>
    </Layout>
  );
}

const getModuleIcon = (name) => {
  switch (name.toLowerCase()) {
    case "listening":
      return <Headphones />;
    case "speaking":
      return <Mic />;
    case "reading":
      return <BookOpen />;
    case "writing":
      return <PenTool />;
    default:
      return <BookOpen />;
  }
};

const getModuleColor = (name) => {
  switch (name.toLowerCase()) {
    case "listening":
      return "bg-gradient-to-r from-blue-500 to-blue-600";
    case "speaking":
      return "bg-gradient-to-r from-purple-500 to-purple-600";
    case "reading":
      return "bg-gradient-to-r from-green-500 to-green-600";
    case "writing":
      return "bg-gradient-to-r from-amber-500 to-amber-600";
    default:
      return "bg-gradient-to-r from-gray-700 to-gray-800";
  }
};