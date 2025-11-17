// src/pages/ExamManagement.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Edit, Trash2, Eye, Search, Filter, Play, Pause, BookOpen, Clock, Users, Check, X } from 'lucide-react';
import { apiClient } from '../services/api';

interface Task {
  _id: string;
  title: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  taskType: 'multiple_choice' | 'video_response' | 'file_upload';
  instruction: string;
  content?: string;
  imageUrl?: string;
  mediaUrl?: string;
  questions: any[];
  durationMinutes: number;
  points: number;
  maxFiles?: number;
  maxFileSize?: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ExamModule {
  name: 'listening' | 'speaking' | 'reading' | 'writing';
  durationMinutes: number;
  bufferMinutes: number;
  taskIds: string[];
}

interface Exam {
  _id?: string;
  title: string;
  level: 'basic' | 'advanced';
  modules: ExamModule[];
  totalMarks: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

export function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load tasks and exams
      const [tasksResponse, examsResponse] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getExams()
      ]);

      setTasks(tasksResponse.data || []);
      setExams(examsResponse.data || []);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExam = async (examData: any) => {
    try {
      setError(null);
      await apiClient.createExam(examData);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create exam:', error);
      setError('Failed to create exam. Please try again.');
    }
  };

  const handleUpdateExam = async (examId: string, examData: any) => {
    try {
      setError(null);
      await apiClient.updateExam(examId, examData);
      await loadData();
    } catch (error) {
      console.error('Failed to update exam:', error);
      setError('Failed to update exam. Please try again.');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        setError(null);
        await apiClient.deleteExam(examId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete exam:', error);
        setError('Failed to delete exam. Please try again.');
      }
    }
  };

  const handleToggleExamStatus = async (examId: string, isActive: boolean) => {
    try {
      await handleUpdateExam(examId, { isActive: !isActive });
    } catch (error) {
      // Error handled in handleUpdateExam
    }
  };

  const getTasksByModule = (module: string) => {
    return tasks.filter(task => task.module === module && task.isActive);
  };

  const getTotalDuration = (exam: Exam) => {
    return exam.modules.reduce((total, module) => total + module.durationMinutes , 0);
  };

  const getTotalQuestions = (exam: Exam) => {
    return exam.modules.reduce((total, module) => total + module.taskIds.length, 0);
  };

  const calculateTotalMarks = (modules: ExamModule[]) => {
    return modules.reduce((total, module) => {
      const moduleTasks = tasks.filter(task => module.taskIds.includes(task._id));
      return total + moduleTasks.reduce((moduleTotal, task) => moduleTotal + task.points, 0);
    }, 0);
  };

  const CreateExamModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      level: 'basic' as 'basic' | 'advanced',
      modules: {
        listening: { durationMinutes: 10, taskIds: [] as string[] },
        speaking: { durationMinutes: 10, taskIds: [] as string[] },
        reading: { durationMinutes: 10, taskIds: [] as string[] },
        writing: { durationMinutes: 10, taskIds: [] as string[] },
      }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const modules = Object.entries(formData.modules)
          .filter(([_, config]) => config.taskIds.length > 0)
          .map(([name, config]) => ({
            name: name as 'listening' | 'speaking' | 'reading' | 'writing',
            durationMinutes: config.durationMinutes,
            bufferMinutes: config.bufferMinutes,
            taskIds: config.taskIds
          }));

        if (modules.length === 0) {
          alert('Please select at least one task for any module.');
          return;
        }

        const examPayload = {
          title: formData.title,
          level: formData.level,
          modules: modules,
          totalMarks: calculateTotalMarks(modules),
          isActive: true
        };

        await handleCreateExam(examPayload);
      } catch (error) {
        // Error handled in handleCreateExam
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-poppins font-bold text-gray-900">Create New Exam</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., English Proficiency Test - Advanced Level"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Module Configuration */}
            {['listening', 'speaking', 'reading', 'writing'].map((module) => {
              const moduleTasks = getTasksByModule(module);
              const selectedTasks = formData.modules[module as keyof typeof formData.modules].taskIds;
              
              return (
                <div key={module} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-inter font-medium text-gray-900 capitalize">{module} Module</h4>
                    <span className="text-sm text-gray-600">
                      {selectedTasks.length} selected • {moduleTasks.length} available
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                      <input
                        type="number"
                        value={formData.modules[module as keyof typeof formData.modules].durationMinutes}
                        onChange={(e) => setFormData({
                          ...formData,
                          modules: {
                            ...formData.modules,
                            [module]: {
                              ...formData.modules[module as keyof typeof formData.modules],
                              durationMinutes: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        min="1"
                        max="60"
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buffer (min) *</label>
                      <input
                        type="number"
                        value={formData.modules[module as keyof typeof formData.modules].bufferMinutes}
                        onChange={(e) => setFormData({
                          ...formData,
                          modules: {
                            ...formData.modules,
                            [module]: {
                              ...formData.modules[module as keyof typeof formData.modules],
                              bufferMinutes: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        min="0"
                        max="10"
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Tasks ({selectedTasks.length})
                      </label>
                      <select
                        multiple
                        value={selectedTasks}
                        onChange={(e) => setFormData({
                          ...formData,
                          modules: {
                            ...formData.modules,
                            [module]: {
                              ...formData.modules[module as keyof typeof formData.modules],
                              taskIds: Array.from(e.target.selectedOptions, option => option.value)
                            }
                          }
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 h-24"
                      >
                        {moduleTasks.map(task => (
                          <option key={task._id} value={task._id}>
                            {task.title} ({task.points} pts)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {selectedTasks.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Selected Tasks:</h5>
                      <div className="text-xs text-blue-700 space-y-1">
                        {selectedTasks.map(taskId => {
                          const task = tasks.find(t => t._id === taskId);
                          return task ? (
                            <div key={taskId} className="flex justify-between">
                              <span>{task.title}</span>
                              <span>{task.points} pts</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-inter font-medium text-gray-900 mb-2">Exam Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Modules:</span>
                  <p className="font-medium">
                    {Object.entries(formData.modules).filter(([_, config]) => config.taskIds.length > 0).length}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total Questions:</span>
                  <p className="font-medium">
                    {Object.values(formData.modules).reduce((total, config) => total + config.taskIds.length, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Marks:</span>
                  <p className="font-medium">
                    {calculateTotalMarks(
                      Object.entries(formData.modules)
                        .filter(([_, config]) => config.taskIds.length > 0)
                        .map(([name, config]) => ({
                          name: name as any,
                          durationMinutes: config.durationMinutes,
                          bufferMinutes: config.bufferMinutes,
                          taskIds: config.taskIds
                        }))
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Exam</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ExamDetailsModal = () => selectedExam && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">Exam Details</h3>
          <button
            onClick={() => setSelectedExam(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-inter font-medium text-gray-900 mb-2">{selectedExam.title}</h4>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedExam.level === 'basic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedExam.level}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedExam.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedExam.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{getTotalDuration(selectedExam)} min</div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{getTotalQuestions(selectedExam)}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{selectedExam.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
          </div>

          <div>
            <h5 className="font-inter font-medium text-gray-900 mb-3">Modules</h5>
            <div className="space-y-3">
              {selectedExam.modules.map((module, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">{module.name}</span>
                    <span className="text-sm text-gray-600">
                      {module.durationMinutes} min
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {module.taskIds.length} tasks • {module.durationMinutes} min 
                  </div>
                  {module.taskIds.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Tasks: {module.taskIds.slice(0, 3).map(taskId => {
                        const task = tasks.find(t => t._id === taskId);
                        return task ? task.title : 'Unknown Task';
                      }).join(', ')}
                      {module.taskIds.length > 3 && ` and ${module.taskIds.length - 3} more`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleToggleExamStatus(selectedExam._id!, !selectedExam.isActive)}
              className={`flex-1 px-4 py-2 rounded-xl font-inter font-medium ${
                selectedExam.isActive
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {selectedExam.isActive ? (
                <>
                  <Pause className="w-4 h-4 inline mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Activate
                </>
              )}
            </button>
            <button
              onClick={() => setSelectedExam(null)}
              className="px-6 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Exam Management">
      <div className="space-y-6 animate-fade-in">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700 font-inter">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Exam Management</h2>
            <p className="text-gray-600 font-inter">Create and manage assessment exams</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-inter">Loading exams...</p>
          </div>
        )}

        {/* Exam List */}
        {!isLoading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-primary-600 mb-1">
                    {exams.length}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">Total Exams</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-green-600 mb-1">
                    {exams.filter(e => e.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">Active Exams</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-blue-600 mb-1">
                    {exams.filter(e => e.level === 'basic').length}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">Basic Level</div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-purple-600 mb-1">
                    {exams.filter(e => e.level === 'advanced').length}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">Advanced Level</div>
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
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 font-inter">
                  Showing {filteredExams.length} of {exams.length} exams
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Exam Title</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Level</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Modules</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Duration</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Tasks</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Marks</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam) => (
                      <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4">
                          <div className="font-inter font-medium text-gray-900">{exam.title}</div>
                          <div className="text-sm text-gray-600 font-inter">
                            Created by {exam.createdBy?.name} • {new Date(exam.createdAt!).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            exam.level === 'basic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {exam.level}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {exam.modules.map(module => (
                              <span key={module.name} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                                {module.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-medium text-gray-900">{getTotalDuration(exam)} min</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-medium text-gray-900">{getTotalQuestions(exam)}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-medium text-gray-900">{exam.totalMarks}</span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleExamStatus(exam._id!, exam.isActive)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              exam.isActive
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-600 bg-gray-50'
                            }`}
                          >
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExam(exam._id!)}
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

              {filteredExams.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter">No exams found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showCreateModal && <CreateExamModal />}
      {selectedExam && <ExamDetailsModal />}
    </Layout>
  );
}