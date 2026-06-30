import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart,
  Settings,
  Play,
  Pause,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Headphones,
  Mic,
  PenTool,
  Target,
  Zap,
  Lock,
  Unlock,
  Download,
  Upload
} from 'lucide-react';
import { httpClient } from '../api/httpClient';

interface ModuleConfig {
  moduleName: 'listening' | 'speaking' | 'reading' | 'writing';
  maxQuestions: number;
  durationMinutes: number;
  bufferMinutes?: number;
}

interface TaskCounts {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
}

interface Exam {
  _id: string;
  level: string;
  title: string;
  moduleConfigs: ModuleConfig[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskCounts: TaskCounts;
}

export function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInitializeModal, setShowInitializeModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; examId: string; examTitle: string } | null>(null);
  const [showModuleModal, setShowModuleModal] = useState<{ exam: Exam; moduleIndex: number } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [detailedView, setDetailedView] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await httpClient.get('teacher/exams');
      setExams(response.data || []);
    } catch (error) {
      console.error('Failed to load exams:', error);
      setError('Failed to load exams. Please try again.');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || exam.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && exam.isActive) ||
                         (filterStatus === 'inactive' && !exam.isActive);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleInitializeExam = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      await httpClient.post('teacher/exams/initialize', {});
      setSuccess('Exam initialized successfully!');
      await loadExams();
      setShowInitializeModal(false);
    } catch (error) {
      console.error('Failed to initialize exam:', error);
      setError('Failed to initialize exam. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleUpdateExam = async (exam: string, examData: any) => {
    try {
      setError(null);
      await httpClient.put(`teacher/exams/${exam}/config`, examData);
      setSuccess('Exam updated successfully!');
      await loadExams();
      setEditingExam(null);
    } catch (error) {
      console.error('Failed to update exam:', error);
      setError('Failed to update exam. Please try again.');
    }
  };

  const handleUpdateModule = async (examId: string, moduleIndex: number, moduleData: any) => {
    try {
      setError(null);
      const exam = exams.find(e => e._id === examId);
      if (!exam) return;

      const updatedModules = [...exam.moduleConfigs];
      updatedModules[moduleIndex] = moduleData;

      await httpClient.put(`teacher/exams/${examId}/config`, {
        moduleConfigs: updatedModules
      });

      setSuccess('Module configuration updated successfully!');
      await loadExams();
      setShowModuleModal(null);
    } catch (error) {
      console.error('Failed to update module:', error);
      setError('Failed to update module. Please try again.');
    }
  };

  const handleToggleStatus = async (examId: string, currentStatus: boolean) => {
    try {
      setError(null);
      const exam = exams.find(e => e._id === examId);
      if (!exam) return;

      const updatedModules = exam.moduleConfigs;

      await httpClient.put(`teacher/exams/${exam.level}/status`, {
        moduleConfigs: updatedModules,
        isActive: !currentStatus
      });

      setSuccess(`Exam ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await loadExams();
    } catch (error) {
      console.error('Failed to update exam status:', error);
      setError('Failed to update exam status. Please try again.');
    }
  };

  const handleDelete = async (examId: string) => {
    try {
      setError(null);
      await httpClient.delete(`teacher/exams/${examId}`);
      setSuccess('Exam deleted successfully!');
      await loadExams();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete exam:', error);
      setError('Failed to delete exam. Please try again.');
    }
  };

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'speaking': return <Mic className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getModuleColor = (moduleName: string) => {
    switch (moduleName) {
      case 'listening': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'speaking': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'reading': return 'bg-green-100 text-green-600 border-green-200';
      case 'writing': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const calculateTotalDuration = (moduleConfigs: ModuleConfig[]) => {
    return moduleConfigs.reduce((total, module) => total + module.durationMinutes, 0);
  };

  const calculateTotalQuestions = (moduleConfigs: ModuleConfig[]) => {
    return moduleConfigs.reduce((total, module) => total + module.maxQuestions, 0);
  };

  const InitializeModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Initialize New Exam
            </h3>
            
            <p className="text-gray-600 mb-6">
              This will create a new exam with default configurations. Continue?
            </p>

            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Basic Level</span>
                <span className="text-sm font-medium text-green-600">✓ Created</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Intermediate Level</span>
                <span className="text-sm font-medium text-green-600">✓ Created</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced Level</span>
                <span className="text-sm font-medium text-green-600">✓ Created</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInitializeModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                disabled={isInitializing}
              >
                Cancel
              </button>
              <button
                onClick={handleInitializeExam}
                disabled={isInitializing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Initialize</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete Exam?
            </h3>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.examTitle}"</strong>? <br />
              This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.examId)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Exam</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ExamDetailsModal = () => {
    if (!selectedExam) return null;

    const totalDuration = calculateTotalDuration(selectedExam.moduleConfigs);
    const totalQuestions = calculateTotalQuestions(selectedExam.moduleConfigs);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Exam Details</h3>
            <button
              onClick={() => setSelectedExam(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-xl">{selectedExam.title}</h4>
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedExam.level)}`}>
                    {selectedExam.level}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedExam.isActive)}`}>
                    {selectedExam.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                    Total Duration: {totalDuration}m
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                    Total Questions: {totalQuestions}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Created</div>
                <div className="text-sm font-medium">{new Date(selectedExam.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Listening</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedExam.taskCounts.listening}</div>
                <div className="text-xs text-gray-600 mt-1">Tasks available</div>
              </div>
              
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Speaking</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedExam.taskCounts.speaking}</div>
                <div className="text-xs text-gray-600 mt-1">Tasks available</div>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Reading</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedExam.taskCounts.reading}</div>
                <div className="text-xs text-gray-600 mt-1">Tasks available</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <PenTool className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Writing</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedExam.taskCounts.writing}</div>
                <div className="text-xs text-gray-600 mt-1">Tasks available</div>
              </div>
            </div>

            {/* Module Configurations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Module Configurations</h4>
              <div className="space-y-3">
                {selectedExam.moduleConfigs.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`p-2 rounded-lg ${getModuleColor(module.moduleName)}`}>
                          {getModuleIcon(module.moduleName)}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-900 capitalize">{module.moduleName}</h5>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {module.maxQuestions} questions max
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {module.durationMinutes} minutes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Available</div>
                        <div className="text-lg font-bold text-gray-900">
                          {selectedExam.taskCounts[module.moduleName as keyof TaskCounts]}
                        </div>
                      </div>
                    </div>
                    
                    {module.bufferMinutes !== undefined && module.bufferMinutes > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-sm text-yellow-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Buffer time: {module.bufferMinutes} minutes
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created By:</span> System
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(selectedExam.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Exam ID:</span> {selectedExam._id.substring(0, 8)}...
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedExam.isActive ? 'Active for students' : 'Hidden from students'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditModuleModal = () => {
    if (!showModuleModal) return null;

    const { exam, moduleIndex } = showModuleModal;
    const module = exam.moduleConfigs[moduleIndex];
    const [formData, setFormData] = useState({
      moduleName: module.moduleName,
      maxQuestions: module.maxQuestions,
      durationMinutes: module.durationMinutes,
      bufferMinutes: module.bufferMinutes || 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await handleUpdateModule(exam._id, moduleIndex, formData);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className={`p-2 rounded-lg ${getModuleColor(module.moduleName)}`}>
                {getModuleIcon(module.moduleName)}
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-900 capitalize">{module.moduleName} Configuration</h3>
                <p className="text-sm text-gray-600">{exam.title}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModuleModal(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Questions *</label>
              <input
                type="number"
                value={formData.maxQuestions}
                onChange={(e) => setFormData({...formData, maxQuestions: parseInt(e.target.value)})}
                min="1"
                max="50"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available tasks: {exam.taskCounts[module.moduleName as keyof TaskCounts]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                min="1"
                max="180"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (minutes, optional)</label>
              <input
                type="number"
                value={formData.bufferMinutes}
                onChange={(e) => setFormData({...formData, bufferMinutes: parseInt(e.target.value)})}
                min="0"
                max="30"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Extra time for transitions and setup</p>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModuleModal(null)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditExamModal = () => {
    const [formData, setFormData] = useState(() => ({
      moduleConfigs: editingExam?.moduleConfigs || [],
      isActive: editingExam?.isActive || true
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!editingExam) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await handleUpdateExam(editingExam.level, formData);
      } finally {
        setIsSubmitting(false);
      }
    };

    const updateModule = (index: number, field: string, value: any) => {
      const newModules = [...formData.moduleConfigs];
      newModules[index] = { ...newModules[index], [field]: value };
      setFormData({ ...formData, moduleConfigs: newModules });
    };

    const toggleExamStatus = () => {
      setFormData({ ...formData, isActive: !formData.isActive });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Exam</h3>
              <p className="text-gray-600">{editingExam.title}</p>
            </div>
            <button
              onClick={() => setEditingExam(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Exam Status</h4>
                <p className="text-sm text-gray-600">
                  {formData.isActive 
                    ? 'This exam is visible to students' 
                    : 'This exam is hidden from students'}
                </p>
              </div>
              <div
                // type="button"
                // onClick={toggleExamStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Module Configurations</h4>
              <div className="space-y-4">
                {formData.moduleConfigs.map((module, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`p-2 rounded-lg ${getModuleColor(module.moduleName)}`}>
                          {getModuleIcon(module.moduleName)}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-900 capitalize">{module.moduleName}</h5>
                          <p className="text-sm text-gray-600">
                            Available tasks: {editingExam.taskCounts[module.moduleName as keyof TaskCounts]}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Questions
                        </label>
                        <input
                          type="number"
                          value={module.maxQuestions}
                          onChange={(e) => updateModule(index, 'maxQuestions', parseInt(e.target.value))}
                          min="1"
                          max="50"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={module.durationMinutes}
                          onChange={(e) => updateModule(index, 'durationMinutes', parseInt(e.target.value))}
                          min="1"
                          max="180"
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingExam(null)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-500 hover:text-green-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Exam Management</h2>
            <p className="text-gray-600 mt-2">Manage and configure all assessment exams</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDetailedView(!detailedView)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {detailedView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{detailedView ? 'Compact View' : 'Detailed View'}</span>
            </button>
            <button
              onClick={() => setShowInitializeModal(true)}
              className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              <span>Initialize Exams</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{exams.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-green-600 font-medium">
                {exams.filter(e => e.isActive).length} active
              </span>
              {' • '}
              <span className="text-gray-600">
                {exams.filter(e => !e.isActive).length} inactive
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {exams.filter(e => e.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Available for student enrollment
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {exams.reduce((total, exam) => 
                    total + Object.values(exam.taskCounts).reduce((a, b) => a + b, 0), 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Across all modules and levels
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {exams.reduce((total, exam) => 
                    total + calculateTotalDuration(exam.moduleConfigs), 0
                  )}m
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Combined duration of all exams
            </div>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Exam Distribution by Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Basic', 'Intermediate', 'Advanced'].map((level) => {
              const levelExams = exams.filter(e => e.level === level);
              const activeExams = levelExams.filter(e => e.isActive);
              
              return (
                <div key={level} className={`p-4 rounded-xl ${getLevelColor(level)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{level}</span>
                    <span className="font-bold text-2xl">{levelExams.length}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {activeExams.length} active • {levelExams.length - activeExams.length} inactive
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${(activeExams.length / levelExams.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams by title or level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-80"
                />
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              Showing <strong>{filteredExams.length}</strong> of <strong>{exams.length}</strong> exams
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading exams...</p>
            </div>
          ) : detailedView ? (
            /* Detailed View */
            <div className="space-y-6">
              {filteredExams.map((exam) => {
                const totalDuration = calculateTotalDuration(exam.moduleConfigs);
                const totalQuestions = calculateTotalQuestions(exam.moduleConfigs);

                return (
                  <div key={exam._id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(exam.level)}`}>
                                {exam.level}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.isActive)}`}>
                                {exam.isActive ? (
                                  <span className="flex items-center">
                                    <Play className="w-3 h-3 mr-1" /> Active
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Pause className="w-3 h-3 mr-1" /> Inactive
                                  </span>
                                )}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              Total Duration: {totalDuration}m • Total Questions: {totalQuestions}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Created</div>
                            <div className="text-sm font-medium">{new Date(exam.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Module Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {exam.moduleConfigs.map((module, index) => (
                            <div key={index} className={`p-4 rounded-xl border ${getModuleColor(module.moduleName)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getModuleIcon(module.moduleName)}
                                  <span className="font-medium capitalize text-sm">{module.moduleName}</span>
                                </div>
                                <span className="text-xs font-medium bg-white px-2 py-1 rounded-full">
                                  {module.maxQuestions} Q
                                </span>
                              </div>
                              <div className="text-2xl font-bold">{exam.taskCounts[module.moduleName as keyof TaskCounts]}</div>
                              <div className="text-xs text-gray-600 mt-1">Tasks available</div>
                              <button
                                onClick={() => setShowModuleModal({ exam, moduleIndex: index })}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Configure
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Task Distribution */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Task Distribution</h4>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            {Object.entries(exam.taskCounts).map(([module, count], index) => {
                              const total = Object.values(exam.taskCounts).reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? (count / total) * 100 : 0;
                              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                              
                              return (
                                <div
                                  key={module}
                                  className={`h-2 rounded-full ${colors[index]} float-left`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${module}: ${count} tasks (${percentage.toFixed(0)}%)`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                            <span>Listening: {exam.taskCounts.listening}</span>
                            <span>Speaking: {exam.taskCounts.speaking}</span>
                            <span>Reading: {exam.taskCounts.reading}</span>
                            <span>Writing: {exam.taskCounts.writing}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Last updated: {new Date(exam.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedExam(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingExam(exam)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Exam"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(exam._id, exam.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            exam.isActive 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={exam.isActive ? 'Deactivate Exam' : 'Activate Exam'}
                        >
                          {exam.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ 
                            show: true, 
                            examId: exam._id, 
                            examTitle: exam.title
                          })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Compact View (Table) */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Exam Details</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Level</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Modules</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Duration</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Status</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Tasks</th>
                    <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam) => {
                    const totalDuration = calculateTotalDuration(exam.moduleConfigs);
                    const totalTasks = Object.values(exam.taskCounts).reduce((a, b) => a + b, 0);

                    return (
                      <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="max-w-md">
                            <div className="font-semibold text-gray-900 mb-1">
                              {exam.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              Created: {new Date(exam.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(exam.level)}`}>
                            {exam.level}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {exam.moduleConfigs.map((module, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-lg text-xs flex items-center ${getModuleColor(module.moduleName)}`}
                                title={`${module.moduleName}: ${module.maxQuestions} questions, ${module.durationMinutes}min`}
                              >
                                {getModuleIcon(module.moduleName)}
                                <span className="ml-1 capitalize">{module.moduleName.charAt(0)}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-gray-900">{totalDuration}m</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.isActive)}`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{totalTasks}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              {Object.entries(exam.taskCounts).map(([module, count], index) => {
                                const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                                
                                return (
                                  <div
                                    key={module}
                                    className={`h-2 rounded-full ${colors[index]} float-left`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${module}: ${count} tasks`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedExam(exam)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingExam(exam)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit Exam"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(exam._id, exam.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                exam.isActive 
                                  ? 'text-yellow-600 hover:bg-yellow-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={exam.isActive ? 'Deactivate Exam' : 'Activate Exam'}
                            >
                              {exam.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ 
                                show: true, 
                                examId: exam._id, 
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No exams found</p>
              <p className="text-gray-500">
                {searchTerm || filterLevel !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Initialize exams to get started'}
              </p>
              <button
                onClick={() => setShowInitializeModal(true)}
                className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all mx-auto"
              >
                <Zap className="w-5 h-5" />
                <span>Initialize Exams</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showInitializeModal && <InitializeModal />}
      {deleteConfirm && <DeleteConfirmationModal />}
      {selectedExam && <ExamDetailsModal />}
      {editingExam && <EditExamModal />}
      {showModuleModal && <EditModuleModal />}
    </Layout>
  );
}