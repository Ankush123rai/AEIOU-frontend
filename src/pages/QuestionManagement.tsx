import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter, Upload } from 'lucide-react';

interface Question {
  id: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  type: 'multiple-choice' | 'audio' | 'video' | 'text' | 'upload';
  question: string;
  options?: string[];
  correctAnswer?: string;
  passage?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  points: number;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      module: 'listening',
      type: 'multiple-choice',
      question: 'What is the main topic of the conversation?',
      options: ['Planning a vacation', 'Discussing work schedules', 'Talking about weather', 'Organizing a meeting'],
      correctAnswer: 'Organizing a meeting',
      difficulty: 'medium',
      timeLimit: 30,
      points: 10,
      createdBy: 'Admin',
      createdAt: '2024-01-10',
      isActive: true
    },
    {
      id: '2',
      module: 'reading',
      type: 'multiple-choice',
      question: 'According to the passage, what has made renewable energy more attractive recently?',
      options: ['Government regulations', 'Decreased costs and improved efficiency', 'Higher fossil fuel prices', 'Environmental campaigns'],
      correctAnswer: 'Decreased costs and improved efficiency',
      passage: 'Renewable energy has emerged as a critical solution...',
      difficulty: 'hard',
      timeLimit: 45,
      points: 15,
      createdBy: 'Dr. Carol Davis',
      createdAt: '2024-01-12',
      isActive: true
    },
    {
      id: '3',
      module: 'speaking',
      type: 'video',
      question: 'Introduce yourself and talk about your hobbies for 2 minutes.',
      difficulty: 'easy',
      timeLimit: 120,
      points: 20,
      createdBy: 'Admin',
      createdAt: '2024-01-15',
      isActive: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || question.module === filterModule;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    
    return matchesSearch && matchesModule && matchesDifficulty;
  });

  const handleDelete = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const handleToggleActive = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, isActive: !q.isActive } : q
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-secondary-600 bg-secondary-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
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

  const AddQuestionModal = () => {
    const [formData, setFormData] = useState({
      module: 'listening',
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      passage: '',
      difficulty: 'medium',
      timeLimit: 30,
      points: 10
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newQuestion: Question = {
        id: Date.now().toString(),
        ...formData,
        options: formData.type === 'multiple-choice' ? formData.options.filter(opt => opt.trim()) : undefined,
        createdBy: 'Current User',
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setQuestions([...questions, newQuestion]);
      setShowAddModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Add New Question</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({...formData, module: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="listening">Listening</option>
                  <option value="speaking">Speaking</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your question here..."
              />
            </div>

            {formData.module === 'reading' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reading Passage</label>
                <textarea
                  value={formData.passage}
                  onChange={(e) => setFormData({...formData, passage: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter the reading passage here..."
                />
              </div>
            )}

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
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                  min="10"
                  max="300"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
              >
                Add Question
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const QuestionDetailsModal = () => selectedQuestion && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">Question Details</h3>
          <button
            onClick={() => setSelectedQuestion(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(selectedQuestion.module)}`}>
              {selectedQuestion.module}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(selectedQuestion.difficulty)}`}>
              {selectedQuestion.difficulty}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {selectedQuestion.points} points
            </span>
          </div>

          <div>
            <h4 className="font-inter font-medium text-gray-900 mb-2">Question</h4>
            <p className="text-gray-700 font-inter">{selectedQuestion.question}</p>
          </div>

          {selectedQuestion.passage && (
            <div>
              <h4 className="font-inter font-medium text-gray-900 mb-2">Reading Passage</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 font-inter text-sm leading-relaxed">{selectedQuestion.passage}</p>
              </div>
            </div>
          )}

          {selectedQuestion.options && (
            <div>
              <h4 className="font-inter font-medium text-gray-900 mb-2">Answer Options</h4>
              <div className="space-y-2">
                {selectedQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border ${
                      option === selectedQuestion.correctAnswer
                        ? 'border-secondary-200 bg-secondary-50 text-secondary-800'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="font-inter text-sm">{option}</span>
                    {option === selectedQuestion.correctAnswer && (
                      <span className="ml-2 text-xs text-secondary-600 font-medium">(Correct)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm text-gray-600">Time Limit:</span>
              <p className="font-medium">{selectedQuestion.timeLimit} seconds</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Created By:</span>
              <p className="font-medium">{selectedQuestion.createdBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Question Management">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Question Management</h2>
            <p className="text-gray-600 font-inter">Create and manage test questions for all modules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['listening', 'speaking', 'reading', 'writing'].map((module) => (
            <div key={module} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center">
                <h4 className="font-poppins font-bold text-gray-900 mb-2 capitalize">{module}</h4>
                <div className="text-2xl font-poppins font-bold text-primary-600 mb-1">
                  {questions.filter(q => q.module === module && q.isActive).length}
                </div>
                <div className="text-sm text-gray-600 font-inter">Active Questions</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
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
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 font-inter">
              Showing {filteredQuestions.length} of {questions.length} questions
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Question</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Module</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Difficulty</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Points</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="max-w-xs">
                        <div className="font-inter font-medium text-gray-900 truncate">
                          {question.question}
                        </div>
                        <div className="text-sm text-gray-600 font-inter">
                          Created by {question.createdBy}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(question.module)}`}>
                        {question.module}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-600 font-inter capitalize">
                        {question.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="font-inter font-medium text-gray-900">{question.points}</span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleActive(question.id)}
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
                          onClick={() => setSelectedQuestion(question)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingQuestion(question)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
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

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">No questions found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddQuestionModal />}
      {selectedQuestion && <QuestionDetailsModal />}
    </Layout>
  );
}