import React, { useMemo, useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, BookOpen, Loader2, CheckCircle } from "lucide-react";
import { useExam } from "../../hooks/useExam";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";

export function ReadingModule() {
  const { currentExam, getModule } = useExam();
  const navigate = useNavigate();

  const readMod = getModule("reading");


  const tasks = useMemo(() => {
    if (Array.isArray(readMod?.taskIds)) {
      const flattened = readMod.taskIds;

      // ✅ Detect if it's the flattened structure (has parentTaskId)
      const isFlattened = flattened.some((t) => t.parentTaskId);

      if (isFlattened) {
        // ✅ Group by parentTaskId
        const grouped = flattened.reduce((acc, item) => {
          const parentId = item.parentTaskId;

          if (!acc[parentId]) {
            acc[parentId] = {
              _id: parentId,
              title: item.title,
              instruction: item.instruction,
              content: item.content,
              module: item.module,
              taskType: item.taskType,
              isActive: item.isActive,
              questions: [],
            };
          }

          // Ensure options are consistent objects
          const normalizedOptions =
            Array.isArray(item.options) &&
            item.options.length > 0 &&
            typeof item.options[0] === "string"
              ? item.options.map((opt, i) => ({
                  id: String.fromCharCode(65 + i), // A, B, C, D
                  text: opt,
                }))
              : item.options;

          acc[parentId].questions.push({
            _id: item._id.split(":")[1] || item._id,
            question: item.question,
            options: normalizedOptions,
            correctAnswer: item.correctAnswer,
            questionType: item.questionType,
            points: item.points,
          });

          return acc;
        }, {});

        return Object.values(grouped);
      }

      // ✅ If already nested properly, just filter active ones
      return flattened.filter((t) => t.isActive !== false);
    }

    return [];
  }, [readMod]);

  const [answers, setAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(
    () => (readMod?.durationMinutes || 10) * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleAnswerChange = (
    taskId: string,
    questionId: string,
    answer: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [questionId]: answer,
      },
    }));
  };

  const currentTask = tasks[currentTaskIndex];
  const allAnsweredForCurrent = currentTask?.questions?.every(
    (q) => answers[currentTask._id]?.[q._id]
  );
  const allAnswered =
    tasks.length > 0 &&
    tasks.every((task) =>
      task.questions?.every((q) => answers[task._id]?.[q._id])
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
    if (!currentExam) return;
    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const responses = [];
    for (const task of tasks) {
      for (const question of task.questions || []) {
        if (answers[task._id]?.[question._id]) {
          responses.push({
            taskId: task._id,
            questionId: question._id,
            answer: answers[task._id][question._id],
          });
        }
      }
    }

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/submissions`,
        {
          examId: currentExam._id,
          module: "reading",
          responses,
        },
        headers
      );

      // Success
      setSubmitSuccess(true);
      setIsSubmitting(false);
      
      // Show success message for 2 seconds then navigate
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

  // Function to safely render HTML content
  const renderHTMLContent = (htmlContent: string) => {
    // Create a temporary div to sanitize the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent || '';
    
    // Basic sanitization - remove potentially dangerous tags
    const sanitizedContent = tempDiv.innerHTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/javascript:/gi, '');
    
    return { __html: sanitizedContent };
  };

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
              <h2 className="text-2xl font-poppins font-bold text-gray-900">
                Reading Assessment
              </h2>
              <p className="text-gray-600 font-inter mt-1">
                Passage {currentTaskIndex + 1} of {tasks.length}
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

          {currentTask ? (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <BookOpen className="w-6 h-6 text-primary-700" />
                  <h3 className="text-lg font-poppins font-bold text-gray-900">
                    {currentTask.title}
                  </h3>
                </div>
                {currentTask.instruction && (
                  <p className="text-gray-600 font-inter mb-3">
                    {currentTask.instruction}
                  </p>
                )}
                <div 
                  className="text-sm text-gray-700 leading-relaxed whitespace-pre-line prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={renderHTMLContent(currentTask.content || '')}
                />
                {/* Fallback text if no HTML content */}
                {!currentTask.content && (
                  <p className="text-gray-500 italic">
                    No content provided for this passage.
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <h3 className="text-lg font-poppins font-bold text-gray-900">
                  Questions
                </h3>

                {currentTask.questions?.map((question, qIndex) => (
                  <div key={question._id} className="bg-gray-50 rounded-xl p-5">
                    <p className="font-inter font-medium text-gray-900 mb-3">
                      {qIndex + 1}. {question.question}
                    </p>
                    {question.options && question.options.length > 0 ? (
                      <div className="space-y-3">
                        {question.options.map((opt) => (
                          <label
                            key={opt.id}
                            className="flex items-center space-x-3 cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name={`q-${question._id}`}
                              value={opt.id}
                              checked={
                                answers[currentTask._id]?.[question._id] ===
                                opt.id
                              }
                              onChange={(e) =>
                                handleAnswerChange(
                                  currentTask._id,
                                  question._id,
                                  e.target.value
                                )
                              }
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 mt-0.5"
                              disabled={isSubmitting || submitSuccess}
                            />
                            <span className="font-inter text-gray-700 group-hover:text-gray-900 leading-relaxed">
                              {opt.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
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
              {tasks.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentTaskIndex
                      ? "bg-primary-600"
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
                disabled={!allAnswered || isSubmitting || submitSuccess}
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
                    {tasks.filter(task => 
                      task.questions?.every(q => answers[task._id]?.[q._id])
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