import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useExam } from "../../hooks/useExam";
import { apiClient } from "../../services/client";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";

export function ListeningModule() {
  const { currentExam, getModule } = useExam();
  const { user } = useAuth();
  const navigate = useNavigate();

  const listenMod = getModule("listening");
  const tasks = useMemo(
    () => (listenMod?.taskIds || []).filter((t) => t.isActive !== false),
    [listenMod]
  );

  const tasksByParent = useMemo(() => {
    const groups: Record<string, any[]> = {};
    tasks.forEach((task) => {
      if (!groups[task.parentTaskId]) groups[task.parentTaskId] = [];
      groups[task.parentTaskId].push(task);
    });
    return groups;
  }, [tasks]);

  const parentTaskIds = Object.keys(tasksByParent);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(
    () => (listenMod?.durationMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentParentTaskId = parentTaskIds[currentTaskIndex];
  const currentTasks = tasksByParent[currentParentTaskId] || [];
  const currentTask = currentTasks[0];

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

  const currentTaskAnswered = currentTasks.every((task) => answers[task._id]);
  const allAnswered = tasks.every((task) => answers[task._id]);

  const goToNextTask = () => {
    if (currentTaskIndex < parentTaskIds.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  const goToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (taskId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [taskId]: answer,
    }));
  };

  // ✅ Fixed Submit function with proper payload structure
  const handleSubmit = async () => {
    if (!currentExam || !user) {
      alert("Please log in to submit answers.");
      return;
    }

    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const responses = tasks
        .filter((task) => task.parentTaskId) // Ensure taskId is defined
        .map((task) => ({
          taskId: task.parentTaskId as string, // Cast to string since it's guaranteed to exist
          questionId: task.questionId,
          answer: answers[task._id],
        }));


      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      };
  
      const res = await axios.post(
        `${API_BASE_URL}/api/submissions`,
        {
          examId: currentExam._id,
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

  return (
    <Layout title="Listening Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-gray-900">
                Listening Assessment
              </h2>
              <p className="text-gray-600 font-inter mt-1">
                Task {currentTaskIndex + 1} of {parentTaskIds.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-700">
                <Clock className="w-5 h-5" />
                <span className="font-inter font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>


          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Media */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">
                  {currentTask?.title || "Listening Task"}
                </h3>

                {currentTask?.instruction && (
                  <p className="text-gray-700 font-inter mb-4">
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
                <h3 className="text-lg font-poppins font-bold text-gray-900">
                  Questions
                </h3>
                <span className="text-sm text-gray-600 font-inter">
                  {currentTasks.length} question
                  {currentTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {currentTasks.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-500">No questions available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTasks.map((task, questionIndex) => (
                    <div key={task._id} className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-inter font-semibold text-gray-900 mb-4">
                        Question {questionIndex + 1}
                      </h4>

                      <p className="text-gray-900 mb-4 font-inter text-lg">
                        {task.question}
                      </p>

                      {task.options && task.options.length > 0 ? (
                        <div className="space-y-3">
                          {task.options.map((option, optionIndex) => (
                            <label
                              key={optionIndex}
                              className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="radio"
                                name={`q-${task._id}`}
                                value={option}
                                checked={answers[task._id] === option}
                                onChange={(e) =>
                                  handleAnswerChange(task._id, e.target.value)
                                }
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="font-inter text-gray-700 group-hover:text-gray-900 text-base">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                          placeholder="Type your answer…"
                          value={answers[task._id] || ""}
                          onChange={(e) =>
                            handleAnswerChange(task._id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`p-4 rounded-lg ${
                  currentTaskAnswered
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentTaskAnswered ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span
                    className={`font-inter text-sm ${
                      currentTaskAnswered ? "text-green-800" : "text-yellow-800"
                    }`}
                  >
                    {currentTaskAnswered
                      ? "All questions answered for this task"
                      : "Please answer all questions to continue"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {currentTaskIndex === parentTaskIds.length - 1 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-600 font-inter">
                {allAnswered
                  ? "All tasks completed. Ready to submit!"
                  : `${tasks.filter((t) => answers[t._id]).length} of ${
                      tasks.length
                    } questions answered`}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          )}


<div className="flex items-center mt-3 justify-between mb-6 bg-gray-50 rounded-xl p-4">
            <button
              onClick={goToPreviousTask}
              disabled={currentTaskIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Task</span>
            </button>

            <div className="flex items-center space-x-2">
              {parentTaskIds.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentTaskIndex
                      ? "bg-primary-600"
                      : index < currentTaskIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNextTask}
              disabled={
                currentTaskIndex === parentTaskIds.length - 1 ||
                !currentTaskAnswered
              }
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <span>Next Task</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}