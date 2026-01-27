import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Play, AlertCircle, Headphones, CheckCircle, Copyright } from "lucide-react";
import { useExam } from "../../context/ExamContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";

export function ListeningModule() {
  const { level } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    currentExam, 
    accessStatus, 
    getExamAccess,
    loading 
  } = useExam();

  // Check access for current level
  const examAccess = level ? getExamAccess(level) : null;
  const hasAccess = examAccess?.hasAccess || false;
  const isCompleted = examAccess?.isCompleted || false;

  const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';

  // console.log("vvvvvv",accessStatus)

  // Fetch listening module tasks
  const { data: moduleData, isLoading: isModuleLoading } = useQuery({
    queryKey: ['listening-module', level],
    queryFn: async () => {
      const response = await httpClient.get(`exams/${formattedLevel}?module=Listening`);
      console.log("responsssss",response)
      return response.data;
    },
    enabled: !!level && hasAccess,
  });

  // Get listening tasks from API response
  const listeningModule = moduleData?.modulesWithTasks?.find(
    (module: any) => module.moduleName.toLowerCase() === 'listening'
  );

  const tasks = useMemo(() => {
    if (!listeningModule?.availableTasks) return [];
    return listeningModule.availableTasks.filter((task: any) => task.isActive !== false);
  }, [listeningModule]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(
    () => (listeningModule?.durationMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTask = tasks[currentTaskIndex];
  const currentTaskQuestions = currentTask?.questions || [];

  // Timer
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [tasks.length]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const allTasksAnswered = tasks.every((task: any) => 
    task.questions?.every((question: any) => answers[question._id])
  );

  const goToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  const goToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!currentExam || !user || !level) {
      alert("Please log in to submit answers.");
      return;
    }

    if (!allTasksAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const responses = tasks.flatMap((task: any) => 
        task.questions?.map((question: any) => ({
          taskId: task._id,
          questionId: question._id,
          answer: answers[question._id],
        })) || []
      );

      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/submissions`,
        {
          examLevel: formattedLevel,
          module: "listening",
          responses,
        },
        headers
      );

      navigate("/dashboard", { 
        state: { message: "Listening test submitted successfully!" } 
      });

    } catch (error: any) {
      console.error("Failed to submit answers:", error);
      
      if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        alert(`Failed to submit answers: ${error.message}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
              You need to unlock this exam before accessing the listening module.
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
    <Layout title="Listening Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Listening Assessment
                </h2>
                <p className="text-gray-600 mt-1">
                  Task {currentTaskIndex + 1} of {tasks.length}
                </p>
              </div>
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Media */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {currentTask?.title || "Listening Task"}
                </h3>

                {currentTask?.instruction && (
                  <p className="text-gray-700 mb-4">
                    {currentTask.instruction}
                  </p>
                )}

                {currentTask?.mediaUrl ? (
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={currentTask.mediaUrl.replace("watch?v=", "embed/")}
                      className="w-full h-64"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Listening Video"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No media available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Questions
                </h3>
                <span className="text-sm text-gray-600">
                  {currentTaskQuestions.length} question
                  {currentTaskQuestions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {currentTaskQuestions.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-500">No questions available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTaskQuestions.map((question: any, questionIndex: number) => (
                    <div key={question._id} className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Question {questionIndex + 1}
                      </h4>

                      <p className="text-gray-900 mb-4 text-lg">
                        {question.question}
                      </p>

                      {question.options && question.options.length > 0 ? (
                        <div className="space-y-3">
                          {question.options.map((option: any) => (
                            <label
                              key={option.id}
                              className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="radio"
                                name={`q-${question._id}`}
                                value={option.id}
                                checked={answers[question._id] === option.id}
                                onChange={(e) =>
                                  handleAnswerChange(question._id, e.target.value)
                                }
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 group-hover:text-gray-900 text-base">
                                {option.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Type your answer…"
                          value={answers[question._id] || ""}
                          onChange={(e) =>
                            handleAnswerChange(question._id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`p-4 rounded-lg ${
                  currentTaskQuestions.every((q: any) => answers[q._id])
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentTaskQuestions.every((q: any) => answers[q._id]) ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      currentTaskQuestions.every((q: any) => answers[q._id]) ? "text-green-800" : "text-yellow-800"
                    }`}
                  >
                    {currentTaskQuestions.every((q: any) => answers[q._id])
                      ? "All questions answered for this task"
                      : "Please answer all questions to continue"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-8 justify-between mb-6 bg-gray-50 rounded-xl p-4">
            <button
              onClick={goToPreviousTask}
              disabled={currentTaskIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Task</span>
            </button>

            <div className="flex items-center space-x-2">
              {tasks.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentTaskIndex
                      ? "bg-blue-600"
                      : index < currentTaskIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {currentTaskIndex === tasks.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allTasksAnswered || isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Listening Test</span>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextTask}
                disabled={!currentTaskQuestions.every((q: any) => answers[q._id])}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <span>Next Task</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {currentTaskIndex === tasks.length - 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {allTasksAnswered
                  ? "All tasks completed. Ready to submit!"
                  : `${tasks.flatMap((t: any) => t.questions || []).filter((q: any) => answers[q._id]).length} of ${
                      tasks.flatMap((t: any) => t.questions || []).length
                    } questions answered`}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}