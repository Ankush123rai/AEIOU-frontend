import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { Users, FileText, BarChart3, Settings, Download, Plus, Check, X, CreditCard as Edit, Trash2, Eye, Mail, Key } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  progress: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  submissionLink?: string;
}

interface QuestionData {
  id: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  type: 'multiple-choice' | 'audio' | 'video' | 'text' | 'upload';
  question: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

interface TeacherCredentials {
  id: string;
  email: string;
  temporaryPassword: string;
  role: 'teacher' | 'admin';
  sentAt: string;
  isUsed: boolean;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StudentData | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
  
  const [users, setUsers] = useState<StudentData[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'student',
      status: 'approved',
      createdAt: '2024-01-15',
      progress: { listening: 100, speaking: 85, reading: 100, writing: 70 },
      submissionLink: 'https://drive.google.com/file/d/1234...'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'student',
      status: 'pending',
      createdAt: '2024-01-16',
      progress: { listening: 75, speaking: 90, reading: 60, writing: 80 }
    },
    {
      id: '3',
      name: 'Dr. Carol Davis',
      email: 'carol@example.com',
      role: 'teacher',
      status: 'approved',
      createdAt: '2024-01-10',
      progress: { listening: 90, speaking: 75, reading: 85, writing: 90 }
    }
  ]);

  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: '1',
      module: 'listening',
      type: 'multiple-choice',
      question: 'What is the main topic of the conversation?',
      options: ['Planning a vacation', 'Discussing work schedules', 'Talking about weather', 'Organizing a meeting'],
      correctAnswer: 'Organizing a meeting',
      difficulty: 'medium',
      points: 10,
      createdAt: '2024-01-10',
      createdBy: 'Admin',
      isActive: true
    },
    {
      id: '2',
      module: 'reading',
      type: 'multiple-choice',
      question: 'According to the passage, what has made renewable energy more attractive recently?',
      options: ['Government regulations', 'Decreased costs and improved efficiency', 'Higher fossil fuel prices', 'Environmental campaigns'],
      correctAnswer: 'Decreased costs and improved efficiency',
      difficulty: 'hard',
      points: 15,
      createdAt: '2024-01-12',
      createdBy: 'Dr. Carol Davis',
      isActive: true
    }
  ]);

  const [credentials, setCredentials] = useState<TeacherCredentials[]>([]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'questions', name: 'Question Bank', icon: FileText },
    { id: 'credentials', name: 'Teacher Access', icon: Key },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddUser = (userData: any) => {
    const addUser = async () => {
      try {
        if (userData.role === 'teacher' || userData.role === 'admin') {
          const tempPassword = generatePassword();
          
          // Add teacher through API
          await apiClient.addTeacher({
            name: userData.name,
            email: userData.email,
            password: tempPassword,
            role: userData.role,
          });
          
          // Track credentials
          const newCredential: TeacherCredentials = {
            id: Date.now().toString(),
            email: userData.email,
            temporaryPassword: tempPassword,
            role: userData.role,
            sentAt: new Date().toISOString(),
            isUsed: false
          };
          setCredentials([...credentials, newCredential]);
          
          alert(`Login credentials sent to ${userData.email}`);
        }
        
        // Refresh users list
        const updatedUsers = await apiClient.getUsers();
        setUsers(updatedUsers);
        
      } catch (error) {
        console.error('Failed to add user:', error);
        alert('Failed to add user. Please try again.');
      }
    };
    
    addUser();
    setShowAddUserModal(false);
  };

  const handleAddQuestion = async (questionData: any) => {
    try {
      await apiClient.createTask({
        module: questionData.module,
        question: questionData.question,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer || '',
        points: questionData.points,
      });
      
      // Refresh questions list
      const updatedQuestions = await apiClient.getTasks();
      setQuestions(updatedQuestions);
      
    } catch (error) {
      console.error('Failed to add question:', error);
      alert('Failed to add question. Please try again.');
    }
    
    setShowAddQuestionModal(false);
  };

  // Load initial data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, questionsData, statsData] = await Promise.all([
          apiClient.getUsers(),
          apiClient.getTasks(),
          apiClient.getDashboardStats(),
        ]);
        
        setUsers(usersData);
        setQuestions(questionsData);
        // Update stats if needed
        
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleUpdateQuestion = (questionData: any) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? { ...q, ...questionData } : q
      ));
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const handleToggleQuestionStatus = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, isActive: !q.isActive } : q
    ));
  };

  const AddUserModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'student',
      status: 'pending'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddUser(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const QuestionModal = ({ question = null }: { question?: QuestionData | null }) => {
    const [formData, setFormData] = useState({
      module: question?.module || 'listening',
      type: question?.type || 'multiple-choice',
      question: question?.question || '',
      options: question?.options || ['', '', '', ''],
      correctAnswer: question?.correctAnswer || '',
      difficulty: question?.difficulty || 'medium',
      points: question?.points || 10
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (question) {
        handleUpdateQuestion(formData);
      } else {
        handleAddQuestion(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({...formData, module: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="listening">Listening</option>
                  <option value="speaking">Speaking</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="text">Text Response</option>
                  <option value="audio">Audio Response</option>
                  <option value="video">Video Response</option>
                  <option value="upload">File Upload</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                rows={3}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {formData.type === 'multiple-choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer Options</label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option}
                        checked={formData.correctAnswer === option}
                        onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                        className="w-4 h-4 text-primary-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({...formData, options: newOptions});
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
              >
                {question ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6 animate-fade-in">
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
                <h3 className="text-xl font-poppins font-bold text-gray-900">System Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-primary-900">
                      {users.filter(u => u.role === 'student').length}
                    </div>
                    <div className="text-sm text-primary-700 font-inter">Total Students</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-blue-700">
                      {users.filter(u => u.role === 'teacher').length}
                    </div>
                    <div className="text-sm text-blue-700 font-inter">Teachers</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-yellow-700">
                      {users.filter(u => u.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-700 font-inter">Pending Approvals</div>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-4">
                    <div className="text-2xl font-poppins font-bold text-secondary-700">
                      {questions.filter(q => q.isActive).length}
                    </div>
                    <div className="text-sm text-secondary-700 font-inter">Active Questions</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-poppins font-bold text-gray-900">User Management</h3>
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-inter font-medium text-gray-700">User</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <div className="font-inter font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600 font-inter">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'approved' ? 'bg-secondary-100 text-secondary-700' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              {user.status === 'pending' && (
                                <>
                                  <button className="p-1 text-secondary-600 hover:text-secondary-800">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-red-600 hover:text-red-800">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button className="p-1 text-gray-600 hover:text-gray-800">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-poppins font-bold text-gray-900">Question Bank</h3>
                  <button 
                    onClick={() => setShowAddQuestionModal(true)}
                    className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {['listening', 'speaking', 'reading', 'writing'].map((module) => (
                    <div key={module} className="bg-gray-50 rounded-xl p-6 text-center">
                      <h4 className="font-poppins font-bold text-gray-900 mb-2 capitalize">{module}</h4>
                      <div className="text-2xl font-poppins font-bold text-primary-600 mb-2">
                        {questions.filter(q => q.module === module && q.isActive).length}
                      </div>
                      <div className="text-sm text-gray-600 font-inter">Active Questions</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Question</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Module</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Difficulty</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Points</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((question) => (
                        <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div className="max-w-xs">
                              <div className="font-inter font-medium text-gray-900 truncate">
                                {question.question}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
                              {question.module}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              question.difficulty === 'easy' ? 'bg-secondary-100 text-secondary-700' :
                              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="font-inter font-medium text-gray-900">{question.points}</span>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleQuestionStatus(question.id)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                question.isActive
                                  ? 'text-secondary-600 bg-secondary-50'
                                  : 'text-gray-600 bg-gray-50'
                              }`}
                            >
                              {question.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingQuestion(question)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'credentials' && (
              <div className="space-y-6">
                <h3 className="text-xl font-poppins font-bold text-gray-900">Teacher Access Management</h3>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <h4 className="font-poppins font-bold text-blue-900">Email Credentials System</h4>
                  </div>
                  <p className="text-blue-800 font-inter">
                    When you add a teacher or admin, login credentials are automatically generated and sent to their email address.
                  </p>
                </div>

                {credentials.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 font-inter font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
                          <th className="text-left py-3 font-inter font-medium text-gray-700">Password</th>
                          <th className="text-left py-3 font-inter font-medium text-gray-700">Sent Date</th>
                          <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {credentials.map((cred) => (
                          <tr key={cred.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 font-inter text-gray-900">{cred.email}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                                {cred.role}
                              </span>
                            </td>
                            <td className="py-4">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {cred.temporaryPassword}
                              </code>
                            </td>
                            <td className="py-4 font-inter text-gray-600">
                              {new Date(cred.sentAt).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                cred.isUsed ? 'bg-secondary-100 text-secondary-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {cred.isUsed ? 'Used' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-poppins font-bold text-gray-900">System Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-inter font-medium text-gray-900">Test Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Test Duration</label>
                        <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                          <option>60 minutes</option>
                          <option>90 minutes</option>
                          <option>120 minutes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score</label>
                        <input
                          type="number"
                          defaultValue="70"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-inter font-medium text-gray-900">Email Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">Send credentials via email</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">Email notifications for new registrations</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700">Daily progress reports</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddUserModal && <AddUserModal />}
      {showAddQuestionModal && <QuestionModal />}
      {editingQuestion && <QuestionModal question={editingQuestion} />}
    </Layout>
  );
}