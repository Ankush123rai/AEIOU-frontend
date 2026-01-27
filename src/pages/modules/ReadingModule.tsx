import React, { useMemo, useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, BookOpen, Loader2, CheckCircle, AlertCircle, Copyright } from "lucide-react";
import { useExam } from "../../context/ExamContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

export function ReadingModule() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    currentExam, 
    getExamAccess,
    loading 
  } = useExam();

  // Check access for current level
  const examAccess = level ? getExamAccess(level) : null;
  const hasAccess = examAccess?.hasAccess || false;
  const isCompleted = examAccess?.isCompleted || false;

  const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';


  // Fetch reading module tasks
  const { data: moduleData, isLoading: isModuleLoading } = useQuery({
    queryKey: ['reading-module', level],
    queryFn: async () => {
      const response = await httpClient.get(`exams/${formattedLevel}?module=Reading`);
      return response.data;
    },
    enabled: !!level && hasAccess,
  });

  // Get reading tasks from API response
  const readingModule = moduleData?.modulesWithTasks?.find(
    (module: any) => module.moduleName.toLowerCase() === 'reading'
  );

  const tasks = useMemo(() => {
    if (!readingModule?.availableTasks) return [];
    return readingModule.availableTasks.filter((task: any) => task.isActive !== false);
  }, [readingModule]);

  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(
    () => (readingModule?.durationMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentTask = tasks[currentTaskIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!isSubmitting && !submitSuccess) {
            submitNow();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tasks.length, isSubmitting, submitSuccess]);

  // Reset states when component mounts
  useEffect(() => {
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleAnswerChange = (taskId: string, questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [questionId]: answer,
      },
    }));
  };

  const allAnsweredForCurrent = currentTask?.questions?.every(
    (q: any) => answers[currentTask._id]?.[q._id]
  );
  
  const allAnswered = tasks.length > 0 &&
    tasks.every((task: any) =>
      task.questions?.every((q: any) => answers[task._id]?.[q._id])
    );

  const goNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };
  
  const goPrev = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const submitNow = async () => {
    if (!currentExam || !user || !level) return;
    if (!allAnswered && tasks.length > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const responses = tasks.flatMap((task: any) => 
      (task.questions || []).map((question: any) => ({
        taskId: task._id,
        questionId: question._id,
        answer: answers[task._id]?.[question._id] || '',
      }))
    );

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        `${API_BASE_URL}/api/submissions`,
        {
          examLevel: formattedLevel,
          module: "reading",
          responses,
        },
        headers
      );

      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error: any) {
      console.error("Submit failed:", error);
      setIsSubmitting(false);
      setSubmitError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to submit answers. Please try again."
      );
    }
  };

  // Check access and redirect if needed
  useEffect(() => {
    if (!loading && level && !hasAccess && !isCompleted) {
      navigate(`/exam/${level}`);
    }
  }, [loading, hasAccess, isCompleted, level, navigate]);

  if (loading || isModuleLoading) {
    return (
      <Layout>
        <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
            <div className="flex flex-col">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                  <span className="text-orange-500">AE</span>
                  <span className="text-blue-600">I</span>
                  <img
                    className="sm:w-7 sm:h-7 w-4 h-4"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                    alt="india"
                  />
                  <span className="text-green-500">U</span>
                  <Copyright className="p-1 relative bottom-2 right-1" />
                </div>
                <span className="sm:text-xs text-[8px] font-medium">
                  Assessment Of English In Our Union
                </span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading listening module...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Access Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to unlock this exam before accessing the reading module.
            </p>
            <button
              onClick={() => navigate(`/exam/${level}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Back to Exam
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reading Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Submission Status Messages */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">
                  Submission Successful!
                </h3>
                <p className="text-green-700 text-sm">
                  Your reading module has been submitted. Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-red-600">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">
                  Submission Failed
                </h3>
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="mt-2 text-red-600 text-sm font-medium hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reading Assessment
              </h2>
              <p className="text-gray-600 mt-1">
                Passage {currentTaskIndex + 1} of {tasks.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {currentTask ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <BookOpen className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentTask.title}
                  </h3>
                </div>
                {currentTask.instruction && (
                  <p className="text-gray-600 mb-3">
                    {currentTask.instruction}
                  </p>
                )}
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentTask.content || ''}
                </div>
                {!currentTask.content && (
                  <p className="text-gray-500 italic">
                    No content provided for this passage.
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Questions
                </h3>

                {currentTask.questions?.map((question: any, qIndex: number) => (
                  <div key={question._id} className="bg-gray-50 rounded-xl p-5">
                    <p className="font-medium text-gray-900 mb-3">
                      {qIndex + 1}. {question.question}
                    </p>
                    {question.options && question.options.length > 0 ? (
                      <div className="space-y-3">
                        {question.options.map((opt: any) => (
                          <label
                            key={opt.id}
                            className="flex items-center space-x-3 cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name={`q-${question._id}`}
                              value={opt.id}
                              checked={
                                answers[currentTask._id]?.[question._id] === opt.id
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  currentTask._id,
                                  question._id,
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5"
                              disabled={isSubmitting || submitSuccess}
                            />
                            <span className="text-gray-700 group-hover:text-gray-900 leading-relaxed">
                              {opt.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Type your answer…"
                        value={answers[currentTask._id]?.[question._id] || ""}
                        onChange={(e) =>
                          handleAnswerChange(
                            currentTask._id,
                            question._id,
                            e.target.value
                          )
                        }
                        disabled={isSubmitting || submitSuccess}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No passage available.
            </div>
          )}

          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
            <button
              onClick={goPrev}
              disabled={currentTaskIndex === 0 || isSubmitting || submitSuccess}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {tasks.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentTaskIndex
                      ? "bg-blue-600"
                      : i < currentTaskIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentTaskIndex === tasks.length - 1 ? (
              <button
                onClick={submitNow}
                disabled={(!allAnswered && tasks.length > 0) || isSubmitting || submitSuccess}
                className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submitted!</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!allAnsweredForCurrent || isSubmitting || submitSuccess}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next Passage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">Progress: </span>
                {tasks.length > 0 ? (
                  <span>
                    {tasks.filter((task: any) => 
                      task.questions?.every((q: any) => answers[task._id]?.[q._id])
                    ).length} of {tasks.length} passages answered
                  </span>
                ) : (
                  <span>0 passages</span>
                )}
              </div>
              <div>
                {isSubmitting && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing your submission...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}