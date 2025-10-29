import React, { useMemo, useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import { useExam } from "../../hooks/useExam";

import axios from "axios";
import { API_BASE_URL } from "../../services/api";

export function ReadingModule() {
  const { currentExam, getModule } = useExam();
  const navigate = useNavigate();

  const readMod = getModule("reading");

  const tasks = useMemo(() => {
    if (Array.isArray(readMod?.taskIds)) {
      if (readMod.taskIds.length && typeof readMod.taskIds[0] === "object") {
        return readMod.taskIds.filter((t) => t.isActive !== false);
      }
    }
    return [];
  }, [readMod]);

  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(
    () => (readMod?.durationMinutes || 10) * 60
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tasks.length]);

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

  const currentTask = tasks[currentTaskIndex];
  const allAnsweredForCurrent =
    currentTask?.questions?.every((q) => answers[currentTask._id]?.[q._id]);
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
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
  
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to submit answers. Please try again.");
    }
  };

  return (
    <Layout title="Reading Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
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

          {/* Passage Navigation */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
            <button
              onClick={goPrev}
              disabled={currentTaskIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
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
                disabled={!allAnswered}
                className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <span>Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!allAnsweredForCurrent}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                <span>Next Passage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Passage & Questions */}
          {currentTask ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Passage */}
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
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentTask.content}
                </p>
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
                            className="flex items-start space-x-3 cursor-pointer group"
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
        </div>
      </div>
    </Layout>
  );
}
