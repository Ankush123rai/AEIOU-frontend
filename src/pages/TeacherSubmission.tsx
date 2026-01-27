// src/pages/TeacherSubmissions.tsx
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Video,
  View,
  Download,
  Play,
  AlertCircle,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../services/api";
import { httpClient } from "../api/httpClient";

interface SubmissionResponse {
  taskId: string;
  questionId?: string;
  answer: string;
  score: number;
  feedback: string;
  maxScore?: number;
}

interface Submission {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  examId: {
    _id: string;
    title: string;
  };
  module: "listening" | "speaking" | "reading" | "writing";
  responses: SubmissionResponse[];
  mediaUrls: string[];
  totalScore: number;
  status: "submitted" | "evaluated";
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  instruction: string;
  content?: string;
  questions: Array<{
    _id: string;
    question: string;
    options?: Array<{ id: string; text: string }>;
    points: number;
  }>;
  points: number;
}

interface Feedback {
  taskId: string;
  questionId?: string;
  score: number;
  feedback: string;
}

interface ReviewFormProps {
  submission: Submission;
  tasks: Record<string, Task>;
  onClose: () => void;
  onReview: (submissionId: string, feedbacks: Feedback[]) => void;
  isReviewing: boolean;
}


const ReviewForm: React.FC<ReviewFormProps> = ({
  submission,
  tasks,
  onClose,
  onReview,
  isReviewing,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [overallFeedback, setOverallFeedback] = useState<string>("");

  const isSpeakingWriting = submission.module === "speaking" || submission.module === "writing";
  const hasResponses = submission.responses.length > 0;
  const hasMedia = submission.mediaUrls.length > 0;

  // Initialize feedbacks based on submission type
  useEffect(() => {
    if (isSpeakingWriting && !hasResponses && hasMedia) {
      // Speaking/Writing with media but no responses
      setOverallScore(submission.totalScore || 0);
      setOverallFeedback("Pending manual review");
      
      // Create feedback entries for each media file
      const newFeedbacks: Feedback[] = submission.mediaUrls.map((url, index) => {
        // Try to find matching task for this submission
        const moduleTasks = Object.values(tasks).filter(
          (task) => task.module === submission.module
        );
        
        const task = moduleTasks[index] || moduleTasks[0];
        
        return {
          taskId: task?._id || `media-${index}`,
          questionId: undefined,
          score: 0,
          feedback: "Pending manual review",
        };
      });
      
      setFeedbacks(newFeedbacks);
    } else if (hasResponses) {
      // Listening/Reading with responses or Speaking/Writing with responses
      const newFeedbacks: Feedback[] = submission.responses.map((response) => ({
        taskId: response.taskId,
        questionId: response.questionId,
        score: response.score,
        feedback: response.feedback || "",
      }));
      
      setFeedbacks(newFeedbacks);
      
      // Calculate overall score for speaking/writing
      if (isSpeakingWriting) {
        const total = newFeedbacks.reduce((sum, fb) => sum + fb.score, 0);
        setOverallScore(total);
        
        // Use first feedback's text or combine them
        if (newFeedbacks.length > 0) {
          const firstFeedback = newFeedbacks[0].feedback;
          if (firstFeedback && firstFeedback !== "Pending manual review") {
            setOverallFeedback(firstFeedback);
          }
        }
      }
    }
  }, [submission, tasks, isSpeakingWriting, hasResponses, hasMedia]);

  const getTask = (taskId: string): Task | undefined => {
    return tasks[taskId];
  };

  const getQuestion = (taskId: string, questionId?: string) => {
    const task = getTask(taskId);
    if (!task || !questionId) return null;
    return task.questions.find((q) => q._id === questionId);
  };

  const getTotalPossibleScore = () => {
    if (isSpeakingWriting) {
      // For speaking/writing, sum of all task points
      const taskIds = submission.responses
        .map((r) => r.taskId)
        .filter((id) => id && id !== "overall");
      
      if (taskIds.length > 0) {
        return taskIds.reduce((total, taskId) => {
          const task = getTask(taskId);
          return total + (task?.points || 10);
        }, 0);
      }
      
      // If no specific tasks, estimate based on media files
      return submission.mediaUrls.length * 10;
    }
    
    // For listening/reading
    return submission.responses.reduce((total, response) => {
      const question = getQuestion(response.taskId, response.questionId);
      return total + (question?.points || response.maxScore || 10);
    }, 0);
  };

  const getCurrentTotalScore = () => {
    if (isSpeakingWriting && !hasResponses) {
      return overallScore;
    }
    return feedbacks.reduce((total, fb) => total + fb.score, 0);
  };

  const handleFeedbackChange = (index: number, field: keyof Feedback, value: any) => {
    const newFeedbacks = [...feedbacks];
    newFeedbacks[index] = { ...newFeedbacks[index], [field]: value };
    setFeedbacks(newFeedbacks);
    
    // Update overall score if speaking/writing
    if (isSpeakingWriting) {
      const total = newFeedbacks.reduce((sum, fb) => sum + fb.score, 0);
      setOverallScore(total);
    }
  };

  const handleOverallScoreChange = (score: number) => {
    setOverallScore(score);
    
    // Update all feedbacks with the same score
    const newFeedbacks = feedbacks.map((fb) => ({
      ...fb,
      score: score,
    }));
    setFeedbacks(newFeedbacks);
  };

  const handleOverallFeedbackChange = (feedback: string) => {
    setOverallFeedback(feedback);
    
    // Update all feedbacks with the same feedback
    const newFeedbacks = feedbacks.map((fb) => ({
      ...fb,
      feedback: feedback,
    }));
    setFeedbacks(newFeedbacks);
  };

  const prepareFeedbacksForSubmission = (): Feedback[] => {
    if (isSpeakingWriting && !hasResponses) {
      // For speaking/writing with media only
      return feedbacks.map((fb) => ({
        taskId: fb.taskId,
        questionId: fb.questionId,
        score: overallScore,
        feedback: overallFeedback,
      }));
    }
    
    // For listening/reading or speaking/writing with responses
    return feedbacks;
  };

  const handleSubmit = () => {
    const feedbacksToSubmit = prepareFeedbacksForSubmission();
    
    if (feedbacksToSubmit.length === 0) {
      alert("No feedback to submit. Please provide scores and feedback.");
      return;
    }
    
    // Validate scores are within range
    for (const fb of feedbacksToSubmit) {
      const task = getTask(fb.taskId);
      const maxScore = task?.points || 10;
      
      if (fb.score < 0 || fb.score > maxScore) {
        alert(`Score ${fb.score} is out of range (0-${maxScore}) for task "${task?.title || fb.taskId}"`);
        return;
      }
    }
    
    onReview(submission._id, feedbacksToSubmit);
  };

  const renderMediaPreview = () => {
    if (!hasMedia) return null;

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Submitted Files</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submission.mediaUrls.map((url, index) => {
            const isVideo =
              url.match(/\.(mp4|webm|mov|avi)$/) ||
              url.includes("/video/");
            const isImage =
              url.match(/\.(jpg|jpeg|png|gif|webp)$/) ||
              url.includes("/image/");

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-700 truncate">
                    {submission.module} submission {index + 1}
                  </span>
                  <div className="flex space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <View className="w-4 h-4 mr-1" />
                      View
                    </a>
                    <a
                      href={url}
                      download
                      className="text-green-600 hover:text-green-800 text-sm flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                <div className="p-4 flex justify-center bg-gray-900">
                  {isVideo ? (
                    <div className="relative w-full">
                      <video
                        src={url}
                        controls
                        className="w-full max-h-64 rounded"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        <Play className="w-3 h-3 inline mr-1" />
                        Video
                      </div>
                    </div>
                  ) : isImage ? (
                    <img
                      src={url}
                      alt={`${submission.module} submission ${index + 1}`}
                      className="max-h-64 w-auto rounded object-contain"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/300x200?text=Image+Not+Available";
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">File Preview Not Available</p>
                      <a
                        href={url}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        Download to view
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSpeakingWritingEvaluation = () => {
    const maxPossibleScore = getTotalPossibleScore();

    return (
      <div className="space-y-6">
        {renderMediaPreview()}

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Overall Evaluation</h4>

          <div className="space-y-4">
            {/* Score Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overall Score (0 - {maxPossibleScore})
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max={maxPossibleScore}
                  value={overallScore}
                  onChange={(e) =>
                    handleOverallScoreChange(parseInt(e.target.value))
                  }
                  className="flex-1"
                  disabled={submission.status === "evaluated"}
                />
                <input
                  type="number"
                  min="0"
                  max={maxPossibleScore}
                  value={overallScore}
                  onChange={(e) =>
                    handleOverallScoreChange(parseInt(e.target.value) || 0)
                  }
                  className="w-24 p-2 border border-gray-300 rounded text-center"
                  disabled={submission.status === "evaluated"}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Poor)</span>
                <span>{maxPossibleScore / 2} (Average)</span>
                <span>{maxPossibleScore} (Excellent)</span>
              </div>
            </div>

            {/* Feedback Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overall Feedback
              </label>
              <textarea
                value={overallFeedback}
                onChange={(e) => handleOverallFeedbackChange(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Provide detailed feedback for this ${submission.module} submission. Include strengths, areas for improvement, and specific suggestions...`}
                disabled={submission.status === "evaluated"}
              />
            </div>

            {/* Rubric Guidance */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Evaluation Rubric
              </h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {submission.module === "speaking" ? (
                  <>
                    <li>
                      <strong>Pronunciation & Clarity (0-3):</strong> Clear
                      speech, correct pronunciation
                    </li>
                    <li>
                      <strong>Fluency & Pace (0-3):</strong> Smooth delivery,
                      appropriate speed
                    </li>
                    <li>
                      <strong>Vocabulary & Grammar (0-2):</strong> Varied
                      vocabulary, correct grammar
                    </li>
                    <li>
                      <strong>Content & Coherence (0-2):</strong> Relevant
                      content, logical organization
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Content & Ideas (0-4):</strong> Depth of analysis,
                      originality
                    </li>
                    <li>
                      <strong>Organization (0-3):</strong> Clear structure,
                      logical flow
                    </li>
                    <li>
                      <strong>Language Use (0-2):</strong> Vocabulary variety,
                      style
                    </li>
                    <li>
                      <strong>Grammar & Mechanics (0-1):</strong> Spelling,
                      punctuation, grammar
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListeningReadingEvaluation = () => {
    return (
      <div className="space-y-6">
        {renderMediaPreview()}

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">
            Question-wise Evaluation
          </h4>

          <div className="space-y-6">
            {submission.responses.map((response, index) => {
              const task = getTask(response.taskId);
              const question = getQuestion(response.taskId, response.questionId);
              const maxScore = question?.points || task?.points || 10;
              const currentFeedback = feedbacks[index] || {
                taskId: response.taskId,
                questionId: response.questionId,
                score: 0,
                feedback: "",
              };

              return (
                <div key={index} className="border border-gray-100 rounded p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {task?.title || `Task ${index + 1}`}
                        </h5>
                        {question && (
                          <p className="text-sm text-gray-600 mt-1">
                            {question.question}
                          </p>
                        )}
                        {task?.instruction && (
                          <p className="text-sm text-gray-500 mt-2">
                            {task.instruction}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-sm text-gray-500">
                          Max: {maxScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student's Response */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student's Response
                    </label>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {response.answer}
                      </p>
                    </div>
                  </div>

                  {/* Evaluation Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Score (0 - {maxScore})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxScore}
                        value={currentFeedback.score}
                        onChange={(e) =>
                          handleFeedbackChange(
                            index,
                            "score",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={submission.status === "evaluated"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feedback
                      </label>
                      <textarea
                        value={currentFeedback.feedback}
                        onChange={(e) =>
                          handleFeedbackChange(index, "feedback", e.target.value)
                        }
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide specific feedback for this response..."
                        disabled={submission.status === "evaluated"}
                      />
                    </div>
                  </div>

                  {/* Question Options (for multiple choice) */}
                  {question?.options && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options
                      </label>
                      <div className="space-y-1 text-sm text-gray-600">
                        {question.options.map((opt) => (
                          <div key={opt.id} className="flex items-center space-x-2">
                            <span className="font-medium">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Review Submission
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">Student:</span>{" "}
                  {submission.studentId.name} ({submission.studentId.email})
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Exam:</span>{" "}
                  {submission.examId.title} ({submission.examLevel})
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      isSpeakingWriting
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {submission.module}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                      submission.status === "evaluated"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {submission.status === "evaluated" ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Evaluated
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content */}
          {isSpeakingWriting && !hasResponses
            ? renderSpeakingWritingEvaluation()
            : renderListeningReadingEvaluation()}

          {/* Summary and Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  {isSpeakingWriting && !hasResponses
                    ? "Overall Score"
                    : "Total Score"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getCurrentTotalScore()} / {getTotalPossibleScore()}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (
                    {getTotalPossibleScore() > 0
                      ? Math.round(
                          (getCurrentTotalScore() / getTotalPossibleScore()) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-gray-900">
                  {new Date(submission.createdAt).toLocaleDateString()}{" "}
                  {new Date(submission.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isReviewing}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isReviewing ||
                  submission.status === "evaluated" ||
                  getCurrentTotalScore() === 0
                }
                className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  submission.status === "evaluated"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : getCurrentTotalScore() === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isReviewing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting Review...
                  </>
                ) : submission.status === "evaluated" ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Already Reviewed
                  </>
                ) : getCurrentTotalScore() === 0 ? (
                  "Please Assign Scores"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [submissionsResponse, tasksResponse] = await Promise.all([
        httpClient.get('teacher/submissions'),
        httpClient.get('teacher/tasks')
      ]);
      
      setSubmissions(submissionsResponse.data || []);

      // Create tasks map
      const tasksMap: Record<string, Task> = {};
      (tasksResponse.data || []).forEach((task: Task) => {
        tasksMap[task._id] = task;
      });
      setTasks(tasksMap);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule =
      filterModule === "all" || submission.module === filterModule;
    const matchesStatus =
      filterStatus === "all" || submission.status === filterStatus;

    return matchesSearch && matchesModule && matchesStatus;
  });

  const handleReviewSubmission = async (submissionId: string, feedbacksToSubmit: Feedback[]) => {
    setIsReviewing(true);
    try {
      await httpClient.post(`teacher/submissions/${submissionId}/review`, {
        feedbacks: feedbacksToSubmit
      });
      
      await loadData();
      setSelectedSubmission(null);
      alert("Submission reviewed successfully!");
    } catch (error: any) {
      console.error("Failed to review submission:", error);
      alert(error.response?.data?.error || "Failed to review submission. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const getModuleInfo = (module: string) => {
    const info = {
      color: "",
      icon: <FileText className="w-4 h-4" />,
      label: ""
    };
    
    switch (module) {
      case "listening":
        info.color = "text-blue-600 bg-blue-50";
        info.icon = <Video className="w-4 h-4" />;
        info.label = "Listening";
        break;
      case "speaking":
        info.color = "text-purple-600 bg-purple-50";
        info.icon = <Video className="w-4 h-4" />;
        info.label = "Speaking";
        break;
      case "reading":
        info.color = "text-green-600 bg-green-50";
        info.icon = <FileText className="w-4 h-4" />;
        info.label = "Reading";
        break;
      case "writing":
        info.color = "text-orange-600 bg-orange-50";
        info.icon = <FileText className="w-4 h-4" />;
        info.label = "Writing";
        break;
    }
    
    return info;
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "submitted").length,
    evaluated: submissions.filter(s => s.status === "evaluated").length,
    uniqueStudents: new Set(submissions.map(s => s.studentId._id)).size
  };

  return (
    <Layout title="Student Submissions">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
          <p className="text-gray-600">Review and evaluate student submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Submissions", value: stats.total, color: "text-blue-600" },
            { label: "Pending Review", value: stats.pending, color: "text-yellow-600" },
            { label: "Evaluated", value: stats.evaluated, color: "text-green-600" },
            { label: "Unique Students", value: stats.uniqueStudents, color: "text-purple-600" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Modules</option>
                <option value="listening">Listening</option>
                <option value="speaking">Speaking</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending</option>
                <option value="evaluated">Evaluated</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => {
                    const moduleInfo = getModuleInfo(submission.module);
                    const isEvaluated = submission.status === 'evaluated';
                    
                    return (
                      <tr key={submission._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{submission.studentId.name}</div>
                          <div className="text-sm text-gray-600">{submission.studentId.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="mr-2">{moduleInfo.icon}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${moduleInfo.color}`}>
                              {moduleInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">
                            {submission.totalScore}
                            {submission.responses.length > 0 && (
                              <span className="text-sm text-gray-500 ml-1">
                                ({submission.responses.length} responses)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
                            isEvaluated 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isEvaluated ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Evaluated
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {isEvaluated ? 'View' : 'Review'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {selectedSubmission && (
        <ReviewForm
          submission={selectedSubmission}
          tasks={tasks}
          onClose={() => setSelectedSubmission(null)}
          onReview={handleReviewSubmission}
          isReviewing={isReviewing}
        />
      )}
    </Layout>
  );
}