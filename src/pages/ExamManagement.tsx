// src/pages/ExamManagement.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Trash2, Eye, Search, Play, Pause, BookOpen, Clock, Users, X, AlertCircle, CheckCircle, Filter } from 'lucide-react';
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; examId: string; examTitle: string } | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'inactive'>('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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

  const getTasksByModule = (module: string) => {
    let filtered = tasks.filter(task => task.module === module);
    
    if (taskFilter === 'active') {
      filtered = filtered.filter(task => task.isActive);
    } else if (taskFilter === 'inactive') {
      filtered = filtered.filter(task => !task.isActive);
    }
    
    return filtered;
  };

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

  const handleToggleExamStatus = async (examId: string) => {
    try {
      setError(null);
      await apiClient.toggleExamStatus(examId);
      await loadData();
    } catch (error) {
      console.error('Failed to update exam:', error);
      setError('Failed to update exam status. Please try again.');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      setError(null);
      await apiClient.deleteExam(examId);
      await loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete exam:', error);
      setError('Failed to delete exam. Please try again.');
    }
  };

  const getTotalDuration = (exam: Exam) => {
    return exam.modules.reduce((total, module) => total + module.durationMinutes, 0);
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
        listening: { durationMinutes: 15, taskIds: [] as string[] },
        speaking: { durationMinutes: 15, taskIds: [] as string[] },
        reading: { durationMinutes: 20, taskIds: [] as string[] },
        writing: { durationMinutes: 20, taskIds: [] as string[] },
      }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedModule, setSelectedModule] = useState<'listening' | 'speaking' | 'reading' | 'writing'>('listening');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const modules = Object.entries(formData.modules)
          .filter(([_, config]) => config.taskIds.length > 0)
          .map(([name, config]) => ({
            name: name as 'listening' | 'speaking' | 'reading' | 'writing',
            durationMinutes: config.durationMinutes,
            taskIds: config.taskIds
          }));

        // Validate at least 2 tasks per selected module
        const modulesWithInsufficientTasks = modules.filter(module => module.taskIds.length < 2);
        if (modulesWithInsufficientTasks.length > 0) {
          const moduleNames = modulesWithInsufficientTasks.map(m => m.name).join(', ');
          alert(`Please select at least 2 tasks for each module. Insufficient tasks in: ${moduleNames}`);
          return;
        }

        if (modules.length === 0) {
          alert('Please select at least one module with tasks.');
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
        console.error('Failed to submit exam:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const toggleTaskSelection = (module: string, taskId: string) => {
      setFormData(prev => {
        const currentTasks = prev.modules[module as keyof typeof prev.modules].taskIds;
        const isSelected = currentTasks.includes(taskId);
        
        let newTasks;
        if (isSelected) {
          newTasks = currentTasks.filter(id => id !== taskId);
        } else {
          newTasks = [...currentTasks, taskId];
        }

        return {
          ...prev,
          modules: {
            ...prev.modules,
            [module]: {
              ...prev.modules[module as keyof typeof prev.modules],
              taskIds: newTasks
            }
          }
        };
      });
    };

    const selectAllTasks = (module: string) => {
      const moduleTasks = getTasksByModule(module);
      setFormData(prev => ({
        ...prev,
        modules: {
          ...prev.modules,
          [module]: {
            ...prev.modules[module as keyof typeof prev.modules],
            taskIds: moduleTasks.map(task => task._id)
          }
        }
      }));
    };

    const clearAllTasks = (module: string) => {
      setFormData(prev => ({
        ...prev,
        modules: {
          ...prev.modules,
          [module]: {
            ...prev.modules[module as keyof typeof prev.modules],
            taskIds: []
          }
        }
      }));
    };

    const ModuleTaskSelector = ({ module }: { module: 'listening' | 'speaking' | 'reading' | 'writing' }) => {
      const moduleTasks = getTasksByModule(module);
      const selectedTasks = formData.modules[module].taskIds;
      const hasActiveTasks = moduleTasks.some(task => task.isActive);

      return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-inter font-semibold text-gray-900 capitalize text-lg">{module} Module</h4>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-600">
                  {selectedTasks.length} selected • {moduleTasks.length} available
                </span>
                {selectedTasks.length < 2 && selectedTasks.length > 0 && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    Minimum 2 tasks required
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => selectAllTasks(module)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => clearAllTasks(module)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.modules[module].durationMinutes}
                onChange={(e) => setFormData({
                  ...formData,
                  modules: {
                    ...formData.modules,
                    [module]: {
                      ...formData.modules[module],
                      durationMinutes: Math.max(1, parseInt(e.target.value) || 1)
                    }
                  }
                })}
                min="1"
                max="180"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Selection
              </label>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                Select at least 2 tasks from the available {moduleTasks.length} tasks
              </div>
            </div>
          </div>

          {!hasActiveTasks ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-yellow-700 text-sm">
                No active tasks available for {module} module. Please create tasks first.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {moduleTasks.map(task => (
                <div
                  key={task._id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTasks.includes(task._id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!task.isActive ? 'opacity-50 bg-gray-100' : ''}`}
                  onClick={() => task.isActive && toggleTaskSelection(module, task._id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedTasks.includes(task._id)
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTasks.includes(task._id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                      <div className="text-xs text-gray-600">
                        {task.points} points • {task.durationMinutes} min • {task.taskType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!task.isActive && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Inactive</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTasks.length > 0 && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Selected Tasks ({selectedTasks.length})
              </h5>
              <div className="text-xs text-blue-700 space-y-1">
                {selectedTasks.map(taskId => {
                  const task = tasks.find(t => t._id === taskId);
                  return task ? (
                    <div key={taskId} className="flex justify-between items-center bg-blue-100 rounded px-2 py-1">
                      <span className="font-medium">{task.title}</span>
                      <span>{task.points} pts</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-poppins font-bold text-gray-900">Create New Exam</h3>
              <p className="text-gray-600 font-inter mt-1">Configure your exam with modules and tasks</p>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700 text-sm font-inter">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-poppins font-semibold text-blue-900 mb-4 text-lg">Basic Information</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., English Proficiency Test - Advanced Level"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Task Filter */}
            <div className="flex items-center justify-between">
              <h4 className="font-poppins font-semibold text-gray-900 text-lg">Module Configuration</h4>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active Tasks</option>
                  <option value="inactive">Inactive Tasks</option>
                  <option value="all">All Tasks</option>
                </select>
              </div>
            </div>

            {/* Module Configuration */}
            <div className="grid gap-6">
              {(['listening', 'speaking', 'reading', 'writing'] as const).map(module => (
                <ModuleTaskSelector key={module} module={module} />
              ))}
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
              <h4 className="font-inter font-semibold text-primary-900 mb-4 text-lg">Exam Summary</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-primary-600 mb-1">
                    {Object.entries(formData.modules).filter(([_, config]) => config.taskIds.length > 0).length}
                  </div>
                  <div className="text-primary-700 font-medium">Active Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-green-600 mb-1">
                    {Object.values(formData.modules).reduce((total, config) => total + config.taskIds.length, 0)}
                  </div>
                  <div className="text-green-700 font-medium">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-blue-600 mb-1">
                    {Object.values(formData.modules).reduce((total, config) => total + config.durationMinutes, 0)}
                  </div>
                  <div className="text-blue-700 font-medium">Total Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-poppins font-bold text-purple-600 mb-1">
                    {calculateTotalMarks(
                      Object.entries(formData.modules)
                        .filter(([_, config]) => config.taskIds.length > 0)
                        .map(([name, config]) => ({
                          name: name as any,
                          durationMinutes: config.durationMinutes,
                          taskIds: config.taskIds
                        }))
                    )}
                  </div>
                  <div className="text-purple-700 font-medium">Total Marks</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-inter font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-semibold hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Exam...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
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

  const DeleteConfirmationModal = () => {
    if (!deleteConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h3 className="text-xl font-poppins font-bold text-gray-900 mb-2">
              Delete Exam?
            </h3>
            
            <p className="text-gray-600 font-inter mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.examTitle}"</strong>? This action cannot be undone and all exam data will be permanently removed.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-inter font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExam(deleteConfirm.examId)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-inter font-semibold hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ExamDetailsModal = () => selectedExam && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-poppins font-bold text-gray-900">Exam Details</h3>
          <button
            onClick={() => setSelectedExam(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-inter font-semibold text-gray-900 text-lg mb-2">{selectedExam.title}</h4>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedExam.level === 'basic' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {selectedExam.level.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedExam.isActive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {selectedExam.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-gray-50 rounded-xl p-4">
              <Clock className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-poppins font-bold text-gray-900">{getTotalDuration(selectedExam)}</div>
              <div className="text-sm text-gray-600 font-medium">Total Minutes</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-4">
              <BookOpen className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-poppins font-bold text-gray-900">{getTotalQuestions(selectedExam)}</div>
              <div className="text-sm text-gray-600 font-medium">Total Tasks</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-4">
              <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-poppins font-bold text-gray-900">{selectedExam.totalMarks}</div>
              <div className="text-sm text-gray-600 font-medium">Total Marks</div>
            </div>
          </div>

          <div>
            <h5 className="font-inter font-semibold text-gray-900 mb-4 text-lg">Modules</h5>
            <div className="space-y-4">
              {selectedExam.modules.map((module, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 capitalize text-lg">{module.name}</span>
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      {module.durationMinutes} minutes
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {module.taskIds.length} tasks • {module.durationMinutes} min 
                  </div>
                  {module.taskIds.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Selected Tasks:</div>
                      <div className="space-y-1">
                        {module.taskIds.slice(0, 5).map(taskId => {
                          const task = tasks.find(t => t._id === taskId);
                          return task ? (
                            <div key={taskId} className="flex justify-between items-center text-xs bg-gray-50 rounded-lg px-3 py-2">
                              <span className="font-medium text-gray-900">{task.title}</span>
                              <span className="text-primary-600 font-semibold">{task.points} pts</span>
                            </div>
                          ) : null;
                        })}
                        {module.taskIds.length > 5 && (
                          <div className="text-center text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                            +{module.taskIds.length - 5} more tasks
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleToggleExamStatus(selectedExam._id!)}
              className={`flex-1 px-6 py-3 rounded-xl font-inter font-semibold transition-all ${
                selectedExam.isActive
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
              }`}
            >
              {selectedExam.isActive ? (
                <>
                  <Pause className="w-4 h-4 inline mr-2" />
                  Deactivate Exam
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Activate Exam
                </>
              )}
            </button>
            <button
              onClick={() => setSelectedExam(null)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-inter font-semibold text-gray-700 hover:bg-gray-50 transition-all"
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700 font-inter">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-poppins font-bold text-gray-900">Exam Management</h2>
            <p className="text-gray-600 font-inter mt-2">Create and manage assessment exams with comprehensive task selection</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-inter font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Exam</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-inter text-lg">Loading exams and tasks...</p>
          </div>
        )}

        {/* Exam List */}
        {!isLoading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-poppins font-bold mb-2">{exams.length}</div>
                  <div className="text-primary-100 font-inter font-medium">Total Exams</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-poppins font-bold mb-2">{exams.filter(e => e.isActive).length}</div>
                  <div className="text-green-100 font-inter font-medium">Active Exams</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-poppins font-bold mb-2">{exams.filter(e => e.level === 'basic').length}</div>
                  <div className="text-blue-100 font-inter font-medium">Basic Level</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-poppins font-bold mb-2">{exams.filter(e => e.level === 'advanced').length}</div>
                  <div className="text-purple-100 font-inter font-medium">Advanced Level</div>
                </div>
              </div>
            </div>

            {/* Exam Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 lg:flex-none">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search exams by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter w-full lg:w-80"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 font-inter bg-gray-50 px-3 py-2 rounded-lg">
                  Showing <strong>{filteredExams.length}</strong> of <strong>{exams.length}</strong> exams
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Exam Title</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Level</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Modules</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Duration</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Tasks</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Marks</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Status</th>
                      <th className="text-left py-4 font-inter font-semibold text-gray-700 text-sm uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam) => (
                      <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="font-inter font-semibold text-gray-900">{exam.title}</div>
                          <div className="text-sm text-gray-600 font-inter mt-1">
                            Created by {exam.createdBy?.name} • {new Date(exam.createdAt!).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            exam.level === 'basic' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {exam.level}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {exam.modules.map(module => (
                              <span key={module.name} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs capitalize font-medium border border-primary-200">
                                {module.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-semibold text-gray-900">{getTotalDuration(exam)} min</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-semibold text-gray-900">{getTotalQuestions(exam)}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-semibold text-primary-600">{exam.totalMarks}</span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleExamStatus(exam._id!)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                              exam.isActive
                                ? 'text-green-600 bg-green-50 border border-green-200 hover:bg-green-100'
                                : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ 
                                show: true, 
                                examId: exam._id!, 
                                examTitle: exam.title 
                              })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Exam"
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
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-inter text-lg mb-2">No exams found</p>
                  <p className="text-gray-500 font-inter">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first exam to get started'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showCreateModal && <CreateExamModal />}
      {selectedExam && <ExamDetailsModal />}
      <DeleteConfirmationModal />
    </Layout>
  );
}