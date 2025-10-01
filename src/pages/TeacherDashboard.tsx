import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CheckCircle, Clock, Star, Eye, MessageSquare, BarChart3, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  submittedAt: string;
  status: 'submitted' | 'reviewed' | 'graded';
  score?: number;
  feedback?: string;
  files?: string[];
}

interface Task {
  id: string;
  module: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  createdAt: string;
}

interface Exam {
  id: string;
  title: string;
  level: string;
  modules: Array<{
    name: string;
    durationMinutes: number;
    bufferMinutes: number;
    taskIds: string[];
  }>;
  createdAt: string;
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateExam, setShowCreateExam] = useState(false);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      const [tasksData, examsData] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getExams(),
      ]);
      
      setTasks(tasksData);
      setExams(examsData);
      
      // Mock submissions data - in real app, this would come from API
      setSubmissions([
        {
          id: '1',
          studentName: 'Alice Johnson',
          studentEmail: 'alice@example.com',
          module: 'speaking',
          submittedAt: '2024-01-20T10:30:00Z',
          status: 'submitted',
        },
        {
          id: '2',
          studentName: 'Bob Smith',
          studentEmail: 'bob@example.com',
          module: 'writing',
          submittedAt: '2024-01-20T09:15:00Z',
          status: 'reviewed',
          score: 85,
          feedback: 'Good structure and grammar. Work on vocabulary variety.',
        },
      ]);
    } catch (error) {
      console.error('Failed to load teacher data:', error);
    }
  };

  const handleReviewSubmission = async (submissionId: string, reviewData: {
    score: number;
    feedback: string;
  }) => {
    try {
      await apiClient.reviewSubmission(submissionId, reviewData);
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, status: 'reviewed' as const, ...reviewData }
          : sub
      ));
      
      setSelectedSubmission(null);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleCreateTask = async (taskData: {
    module: string;
    question: string;
    options: string[];
    correctAnswer: string;
    points: number;
  }) => {
    try {
      await apiClient.createTask(taskData);
      await loadTeacherData(); // Refresh data
      setShowCreateTask(false);
      alert('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const handleCreateExam = async (examData: {
    title: string;
    level: string;
    modules: Array<{
      name: string;
      durationMinutes: number;
      bufferMinutes: number;
      taskIds: string[];
    }>;
  }) => {
    try {
      await apiClient.createExam(examData);
      await loadTeacherData(); // Refresh data
      setShowCreateExam(false);
      alert('Exam created successfully!');
    } catch (error) {
      console.error('Failed to create exam:', error);
      alert('Failed to create exam. Please try again.');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'submissions', name: 'Review Submissions', icon: FileText },
    { id: 'tasks', name: 'Manage Tasks', icon: Edit },
    { id: 'exams', name: 'Manage Exams', icon: Users },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-600 bg-yellow-50';
      case 'reviewed': return 'text-blue-600 bg-blue-50';
      case 'graded': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'listening': return 'text-blue-600 bg-blue-50';
      case 'speaking': return 'text-purple-600 bg-purple-50';
      case 'reading': return 'text-green-600 bg-green-50';
      case 'writing': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const ReviewModal = () => selectedSubmission && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">Review Submission</h3>
          <button
            onClick={() => setSelectedSubmission(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Student:</span>
                <p className="font-medium">{selectedSubmission.studentName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Module:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(selectedSubmission.module)}`}>
                  {selectedSubmission.module}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleReviewSubmission(selectedSubmission.id, {
              score: parseInt(formData.get('score') as string),
              feedback: formData.get('feedback') as string,
            });
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  defaultValue={selectedSubmission.score || ''}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea
                  name="feedback"
                  rows={4}
                  defaultValue={selectedSubmission.feedback || ''}
                  placeholder="Provide detailed feedback for the student..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const CreateTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">Create New Task</h3>
          <button
            onClick={() => setShowCreateTask(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const options = [
            formData.get('option1') as string,
            formData.get('option2') as string,
            formData.get('option3') as string,
            formData.get('option4') as string,
          ].filter(opt => opt.trim());
          
          handleCreateTask({
            module: formData.get('module') as string,
            question: formData.get('question') as string,
            options,
            correctAnswer: formData.get('correctAnswer') as string,
            points: parseInt(formData.get('points') as string),
          });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
              <select name="module" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                <option value="listening">Listening</option>
                <option value="speaking">Speaking</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                name="question"
                rows={3}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(num => (
                  <input
                    key={num}
                    type="text"
                    name={`option${num}`}
                    placeholder={`Option ${num}`}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <input
                type="text"
                name="correctAnswer"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                name="points"
                min="1"
                max="50"
                defaultValue="10"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setShowCreateTask(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <Layout title="Teacher Dashboard">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Welcome, {user?.name}</h2>
            <p className="text-gray-600 font-inter">Manage tasks, exams, and review student submissions</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-inter font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-poppins font-bold text-gray-900">Dashboard Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-primary-900">{tasks.length}</div>
                    <div className="text-sm text-primary-700 font-inter">Total Tasks</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-blue-700">{exams.length}</div>
                    <div className="text-sm text-blue-700 font-inter">Active Exams</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-yellow-700">
                      {submissions.filter(s => s.status === 'submitted').length}
                    </div>
                    <div className="text-sm text-yellow-700 font-inter">Pending Reviews</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-secondary-700">
                      {submissions.filter(s => s.status === 'reviewed').length}
                    </div>
                    <div className="text-sm text-secondary-700 font-inter">Completed Reviews</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-poppins font-bold text-gray-900">Student Submissions</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Student</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Module</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Submitted</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Score</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <div className="font-inter font-medium text-gray-900">{submission.studentName}</div>
                              <div className="text-sm text-gray-600 font-inter">{submission.studentEmail}</div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(submission.module)}`}>
                              {submission.module}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-gray-600 font-inter">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="font-inter font-medium text-gray-900">
                              {submission.score ? `${submission.score}%` : '-'}
                            </span>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 font-inter font-medium"
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
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-poppins font-bold text-gray-900">Manage Tasks</h3>
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(task.module)}`}>
                              {task.module}
                            </span>
                            <span className="text-sm text-gray-600">{task.points} points</span>
                          </div>
                          <p className="font-inter font-medium text-gray-900 mb-2">{task.question}</p>
                          {task.options && (
                            <div className="text-sm text-gray-600">
                              Options: {task.options.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-600 hover:text-gray-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-poppins font-bold text-gray-900">Manage Exams</h3>
                  <button
                    onClick={() => setShowCreateExam(true)}
                    className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Exam</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-inter font-medium text-gray-900 mb-2">{exam.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Level: {exam.level}</span>
                            <span>Modules: {exam.modules.length}</span>
                            <span>Created: {new Date(exam.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-600 hover:text-gray-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedSubmission && <ReviewModal />}
      {showCreateTask && <CreateTaskModal />}
    </Layout>
  );
}