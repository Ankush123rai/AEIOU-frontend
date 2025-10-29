// src/pages/TeacherSubmissions.tsx
import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { API_BASE_URL, apiClient } from "../services/api";

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
  reviewedBy?: string;
  reviewedAt?: string;
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

// Separate component for the review form
const ReviewForm = React.memo(({ 
  submission, 
  tasks, 
  onClose, 
  onReview, 
  isReviewing 
}: {
  submission: Submission;
  tasks: Record<string, Task>;
  onClose: () => void;
  onReview: (submissionId: string, feedbacks: Feedback[]) => void;
  isReviewing: boolean;
}) => {
  const [localFeedbacks, setLocalFeedbacks] = useState<Feedback[]>([]);

  // Initialize local feedbacks when submission changes
  useEffect(() => {
    setLocalFeedbacks(submission.responses.map(response => ({
      taskId: response.taskId,
      questionId: response.questionId,
      score: response.score,
      feedback: response.feedback || ""
    })));
  }, [submission]);

  const updateLocalFeedback = (taskId: string, questionId: string | undefined, field: string, value: any) => {
    setLocalFeedbacks(prev => {
      const existingIndex = prev.findIndex(fb => 
        fb.taskId === taskId && fb.questionId === questionId
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
        return updated;
      } else {
        return [...prev, { 
          taskId, 
          questionId, 
          score: field === 'score' ? value : 0, 
          feedback: field === 'feedback' ? value : '',
          [field]: value 
        }];
      }
    });
  };

  const handleSubmit = () => {
    onReview(submission._id, localFeedbacks);
  };

  const getTask = (taskId: string): Task | undefined => {
    return tasks[taskId];
  };

  const getQuestion = (taskId: string, questionId?: string) => {
    const task = getTask(taskId);
    if (!task || !questionId) return null;
    return task.questions.find(q => q._id === questionId);
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case "listening":
        return "text-blue-600 bg-blue-50";
      case "speaking":
        return "text-purple-600 bg-purple-50";
      case "reading":
        return "text-green-600 bg-green-50";
      case "writing":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "evaluated":
        return "text-green-600 bg-green-50";
      case "submitted":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getMediaIcon = (module: string) => {
    switch (module) {
      case "speaking":
        return <Video className="w-4 h-4" />;
      case "writing":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const taskGroups = submission.responses.reduce((groups, response) => {
    if (!groups[response.taskId]) {
      groups[response.taskId] = [];
    }
    groups[response.taskId].push(response);
    return groups;
  }, {} as Record<string, SubmissionResponse[]>);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-poppins font-bold text-gray-900">Review Submission</h3>
          <p className="text-gray-600 font-inter">
            {submission.studentId.name} - {submission.examId.title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(submission.module)}`}>
              {submission.module}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Submitted: {new Date(submission.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            Current Score: {submission.totalScore}
          </div>
          <div className="text-sm text-gray-600">
            {submission.responses.length} responses
          </div>
        </div>
      </div>

      {/* Media Files */}
      {submission.mediaUrls.length > 0 && (
        <div className="mb-6">
          <h4 className="font-inter font-medium text-gray-900 mb-3 flex items-center space-x-2">
            {getMediaIcon(submission.module)}
            <span>Submitted Files</span>
          </h4>
          <div className="space-y-2">
            {submission.mediaUrls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="font-inter text-sm text-gray-700">
                  {url.split('/').pop()}
                </span>
                <a
                  href={`${API_BASE_URL}${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <View className="w-4 h-4" />
                  <span>View</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(taskGroups).map(([taskId, responses]) => {
          const task = getTask(taskId);
          return (
            <div key={taskId} className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-inter font-semibold text-gray-900 mb-3">
                {task?.title || 'Task'} ({responses.length} responses)
              </h4>
              {task?.instruction && (
                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                  {task.instruction}
                </p>
              )}
              
              <div className="space-y-4">
                {responses.map((response, index) => {
                  const question = getQuestion(taskId, response.questionId);
                  const maxPoints = question?.points || task?.points || 10;
                  const currentFeedback = localFeedbacks.find(fb => 
                    fb.taskId === response.taskId && fb.questionId === response.questionId
                  );

                  return (
                    <div key={`${response.taskId}-${response.questionId || 'main'}-${index}`} className="border border-gray-100 rounded-lg p-4">
                      {question && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-900 mb-2">{question.question}</h5>
                          {question.options && (
                            <div className="space-y-1 text-sm text-gray-600">
                              {question.options.map(opt => (
                                <div key={opt.id} className="flex items-center space-x-2">
                                  <span className="font-medium">{opt.id}.</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student's Answer
                        </label>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-900 font-inter">
                            {response.answer}
                          </p>
                        </div>
                      </div>

                      {/* Scoring */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score (0 - {maxPoints})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={maxPoints}
                            value={currentFeedback?.score ?? response.score}
                            onChange={(e) => updateLocalFeedback(
                              response.taskId, 
                              response.questionId, 
                              'score', 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Score
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
                              <span className="font-medium text-gray-900">
                                {response.score} / {maxPoints}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback
                        </label>
                        <textarea
                          value={currentFeedback?.feedback ?? response.feedback}
                          onChange={(e) => updateLocalFeedback(
                            response.taskId, 
                            response.questionId, 
                            'feedback', 
                            e.target.value
                          )}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                          placeholder="Provide constructive feedback..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          // disabled={isReviewing || submission.status === 'evaluated'}
          className="flex-1 px-4 py-3 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {isReviewing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>
                {submission.status === 'evaluated' ? 'Already Reviewed' : 'Submit Review'}
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
});

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [submissionsResponse, tasksResponse] = await Promise.all([
        apiClient.getTeacherSubmissions(),
        apiClient.getTasks(),
      ]);

      setSubmissions(submissionsResponse.data || []);

      // Create tasks map for easy access
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
      submission.studentId.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.examId.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule =
      filterModule === "all" || submission.module === filterModule;
    const matchesStatus =
      filterStatus === "all" || submission.status === filterStatus;

    return matchesSearch && matchesModule && matchesStatus;
  });

  const handleReviewSubmission = async (submissionId: string, feedbacksToSubmit: Feedback[]) => {
    if (feedbacksToSubmit.length === 0) {
      alert("Please provide feedback for at least one response.");
      return;
    }

    setIsReviewing(true);
    try {
      await apiClient.reviewSubmission(submissionId, { feedbacks: feedbacksToSubmit });
      await loadData();
      setSelectedSubmission(null);
      setFeedbacks([]);
      alert("Submission reviewed successfully!");
    } catch (error) {
      console.error("Failed to review submission:", error);
      alert("Failed to review submission. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case "listening":
        return "text-blue-600 bg-blue-50";
      case "speaking":
        return "text-purple-600 bg-purple-50";
      case "reading":
        return "text-green-600 bg-green-50";
      case "writing":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "evaluated":
        return "text-green-600 bg-green-50";
      case "submitted":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const SubmissionReviewModal = () => {
    if (!selectedSubmission) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <ReviewForm 
            submission={selectedSubmission}
            tasks={tasks}
            onClose={() => {
              setSelectedSubmission(null);
              setFeedbacks([]);
            }}
            onReview={handleReviewSubmission}
            isReviewing={isReviewing}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout title="Student Submissions">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">
              Student Submissions
            </h2>
            <p className="text-gray-600 font-inter">
              Review and evaluate student submissions
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-primary-600 mb-1">
                {submissions.length}
              </div>
              <div className="text-sm text-gray-600 font-inter">
                Total Submissions
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-yellow-600 mb-1">
                {submissions.filter((s) => s.status === "submitted").length}
              </div>
              <div className="text-sm text-gray-600 font-inter">
                Pending Review
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-green-600 mb-1">
                {submissions.filter((s) => s.status === "evaluated").length}
              </div>
              <div className="text-sm text-gray-600 font-inter">Evaluated</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-purple-600 mb-1">
                {new Set(submissions.map((s) => s.studentId._id)).size}
              </div>
              <div className="text-sm text-gray-600 font-inter">
                Unique Students
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student or exam..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
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
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Pending</option>
                  <option value="evaluated">Evaluated</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 font-inter">
              Showing {filteredSubmissions.length} of {submissions.length}{" "}
              submissions
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Student
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Exam
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Module
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Responses
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Score
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Submitted
                  </th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <div className="font-inter font-medium text-gray-900">
                        {submission.studentId.name}
                      </div>
                      <div className="text-sm text-gray-600 font-inter">
                        {submission.studentId.email}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-inter text-gray-900">
                        {submission.examId.title}
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(
                          submission.module
                        )}`}
                      >
                        {submission.module}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="font-inter text-gray-900">
                        {submission.responses.length}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="font-inter font-medium text-gray-900">
                        {submission.totalScore}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {submission.status === "submitted" ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Evaluated</span>
                          </div>
                        )}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-600 font-inter">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">
                No submissions found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSubmission && <SubmissionReviewModal />}
    </Layout>
  );
}