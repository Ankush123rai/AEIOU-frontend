import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter, Headphones, BookOpen, Mic, PenTool, X, Save, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { httpClient } from '../api/httpClient';

interface QuestionOption {
  id: string;
  text: string;
}

interface TaskQuestion {
  _id?: string;
  question: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  points: number;
  questionType: 'multiple_choice' | 'text_response' | 'file_upload' | 'video_response';
}

interface Task {
  _id?: string;
  category: 'Basic' | 'Advanced';
  title: string;
  module: 'listening' | 'speaking' | 'reading' | 'writing';
  taskType: 'multiple_choice' | 'video_response' | 'file_upload';
  instruction: string;
  content?: string;
  imageUrl?: string;
  mediaUrl?: string;
  questions: TaskQuestion[];
  durationMinutes: number;
  points: number;
  maxFiles?: number;
  maxFileSize?: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

interface FilterState {
  category: string;
  module: string;
  type: string;
}

export function QuestionManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterState>({
    category: 'Basic',
    module: 'all',
    type: 'all'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; taskId: string; taskTitle: string } | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [filter.category, filter.module]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('category', filter.category);
      if (filter.module !== 'all') {
        queryParams.append('module', filter.module);
      }

      const response = await httpClient.get(`teacher/tasks?${queryParams.toString()}`);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.instruction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter.type === 'all' || task.taskType === filter.type;
    
    return matchesSearch && matchesType;
  });

  const handleAddTask = async (taskData: any) => {
    try {
      setError(null);
      await httpClient.post('teacher/tasks', taskData);
      await loadTasks();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    try {
      setError(null);
      await httpClient.put(`teacher/tasks/${taskId}`, taskData);
      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      setError(null);
      await apiClient.deleteTask(taskId);
      await loadTasks();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    }
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
              Delete Task?
            </h3>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>"{deleteConfirm.taskTitle}"</strong>? <br />
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
                onClick={() => handleDelete(deleteConfirm.taskId)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'listening': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'speaking': return 'text-purple-600 bg-purple-50 border border-purple-200';
      case 'reading': return 'text-green-600 bg-green-50 border border-green-200';
      case 'writing': return 'text-orange-600 bg-orange-50 border border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'speaking': return <Mic className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'writing': return <PenTool className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'video_response': return 'text-purple-600 bg-purple-50 border border-purple-200';
      case 'file_upload': return 'text-orange-600 bg-orange-50 border border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basic': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'Advanced': return 'text-purple-600 bg-purple-50 border border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-50 border border-green-200'
      : 'text-gray-600 bg-gray-50 border border-gray-200';
  };

  const AddTaskModal = () => {
    const [formData, setFormData] = useState({
      category: 'Basic' as 'Basic' | 'Advanced',
      title: '',
      module: 'listening' as const,
      taskType: 'multiple_choice' as const,
      instruction: '',
      content: '',
      imageUrl: '',
      mediaUrl: '',
      durationMinutes: 10,
      points: 10,
      maxFiles: 1,
      maxFileSize: 100,
      isActive: true,
      questions: [
        {
          question: '',
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' }
          ],
          correctAnswer: '',
          explanation: '',
          points: 5,
          questionType: 'multiple_choice' as const
        }
      ]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const addQuestion = () => {
      setFormData({
        ...formData,
        questions: [
          ...formData.questions,
          {
            question: '',
            options: [
              { id: 'A', text: '' },
              { id: 'B', text: '' },
              { id: 'C', text: '' },
              { id: 'D', text: '' }
            ],
            correctAnswer: '',
            explanation: '',
            points: 5,
            questionType: 'multiple_choice'
          }
        ]
      });
    };

    const removeQuestion = (index: number) => {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
      const newQuestions = [...formData.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      setFormData({ ...formData, questions: newQuestions });
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
      const newQuestions = [...formData.questions];
      const newOptions = [...newQuestions[qIndex].options!];
      newOptions[optIndex] = { ...newOptions[optIndex], text: value };
      newQuestions[qIndex].options = newOptions;
      setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        // Filter out empty questions and options
        const processedData = {
          ...formData,
          questions: formData.questions
            .filter(q => q.question.trim())
            .map(q => ({
              ...q,
              options: q.options?.filter(opt => opt.text.trim())
            }))
        };

        await handleAddTask(processedData);
      } catch (error) {
        // Error handled in handleAddTask
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Create New Task</h3>
            <button
              onClick={() => setShowAddModal(false)}
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
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as 'Basic' | 'Advanced'})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Basic">Basic</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type *</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({...formData, taskType: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="video_response">Video Response</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    min="1"
                    max="60"
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Points *</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* {formData.taskType === 'file_upload' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Files</label>
                    <input
                      type="number"
                      value={formData.maxFiles}
                      onChange={(e) => setFormData({...formData, maxFiles: parseInt(e.target.value)})}
                      min="1"
                      max="10"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={formData.maxFileSize}
                      onChange={(e) => setFormData({...formData, maxFileSize: parseInt(e.target.value)})}
                      min="1"
                      max="1000"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )} */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruction *</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter task instructions for students..."
              />
            </div>

            {/* Content/Media based on module */}
            {(formData.module === 'listening' || formData.module === 'reading') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.module === 'listening' ? 'Audio/Video Content' : 'Reading Passage'}
                </label>
                {formData.module === 'listening' ? (
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({...formData, content: value})}
                    modules={modules}
                    formats={formats}
                    className="rounded-xl overflow-hidden mb-12"
                  />
                )}
              </div>
            )}

            {formData.module === 'speaking' && formData.taskType === 'video_response' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Questions for multiple choice tasks */}
            {formData.taskType === 'multiple_choice' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 text-lg">Question {qIndex + 1}</h4>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter question..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Options *</label>
                          <div className="space-y-3">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  value={option.id}
                                  checked={question.correctAnswer === option.id}
                                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="w-6 text-sm font-medium text-gray-600">{option.id}.</span>
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  required
                                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder={`Option ${option.id}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Select the radio button for correct answer
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Explain why this answer is correct..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                            min="1"
                            max="50"
                            className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditTaskModal = () => {
    const [formData, setFormData] = useState(() => ({
      category: editingTask?.category || 'Basic' as 'Basic' | 'Advanced',
      title: editingTask?.title || '',
      module: editingTask?.module || 'listening',
      taskType: editingTask?.taskType || 'multiple_choice',
      instruction: editingTask?.instruction || '',
      content: editingTask?.content || '',
      imageUrl: editingTask?.imageUrl || '',
      mediaUrl: editingTask?.mediaUrl || '',
      durationMinutes: editingTask?.durationMinutes || 10,
      points: editingTask?.points || 10,
      maxFiles: editingTask?.maxFiles || 1,
      maxFileSize: editingTask?.maxFileSize || 100,
      isActive: editingTask?.isActive || true,
      questions: editingTask?.questions.map(q => ({
        ...q,
        options: q.options || [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ],
        explanation: q.explanation || ''
      })) || []
    }));

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!editingTask) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const processedData = {
          ...formData,
          questions: formData.questions
            .filter(q => q.question.trim())
            .map(q => ({
              ...q,
              options: q.options?.filter(opt => opt.text.trim())
            }))
        };

        await handleUpdateTask(editingTask._id!, processedData);
      } catch (error) {
        // Error handled in handleUpdateTask
      } finally {
        setIsSubmitting(false);
      }
    };

    const addQuestion = () => {
      setFormData({
        ...formData,
        questions: [
          ...formData.questions,
          {
            question: '',
            options: [
              { id: 'A', text: '' },
              { id: 'B', text: '' },
              { id: 'C', text: '' },
              { id: 'D', text: '' }
            ],
            correctAnswer: '',
            explanation: '',
            points: 5,
            questionType: 'multiple_choice'
          }
        ]
      });
    };
    
    const removeQuestion = (index: number) => {
      const newQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({ ...formData, questions: newQuestions });
    };
    
    const updateQuestion = (index: number, field: string, value: any) => {
      const newQuestions = [...formData.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      setFormData({ ...formData, questions: newQuestions });
    };
    
    const updateOption = (qIndex: number, optIndex: number, value: string) => {
      const newQuestions = [...formData.questions];
      const newOptions = [...newQuestions[qIndex].options!];
      newOptions[optIndex] = { ...newOptions[optIndex], text: value };
      newQuestions[qIndex].options = newOptions;
      setFormData({ ...formData, questions: newQuestions });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Edit Task</h3>
            <button
              onClick={() => setEditingTask(null)}
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
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as 'Basic' | 'Advanced'})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter task title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type *</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => setFormData({...formData, taskType: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="video_response">Video Response</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    min="1"
                    max="60"
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points *</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {formData.taskType === 'file_upload' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Files</label>
                    <input
                      type="number"
                      value={formData.maxFiles}
                      onChange={(e) => setFormData({...formData, maxFiles: parseInt(e.target.value)})}
                      min="1"
                      max="10"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={formData.maxFileSize}
                      onChange={(e) => setFormData({...formData, maxFileSize: parseInt(e.target.value)})}
                      min="1"
                      max="1000"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instruction *</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="Enter task instructions for students..."
              />
            </div>

            {/* Content/Media based on module */}
            {(formData.module === 'listening' || formData.module === 'reading') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.module === 'listening' ? 'Audio/Video Content' : 'Reading Passage'}
                </label>
                {formData.module === 'listening' ? (
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({...formData, content: value})}
                    modules={modules}
                    formats={formats}
                    className="rounded-xl overflow-hidden mb-12"
                  />
                )}
              </div>
            )}

            {formData.module === 'speaking' && formData.taskType === 'video_response' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Questions for multiple choice tasks */}
            {formData.taskType === 'multiple_choice' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Question Text *</label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter question..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Options *</label>
                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  value={option.id}
                                  checked={question.correctAnswer === option.id}
                                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                  className="w-4 h-4 text-primary-600"
                                />
                                <span className="w-6 text-sm font-medium text-gray-600">{option.id}.</span>
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  required
                                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                  placeholder={`Option ${option.id}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Select the radio button for correct answer</p>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Explanation (Optional)</label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Explain why this answer is correct..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                            min="1"
                            max="50"
                            className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

  const TaskDetailsModal = () => selectedTask && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Task Details</h3>
          <button
            onClick={() => setSelectedTask(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm flex font-medium capitalize ${getCategoryColor(selectedTask.category)}`}>
              <span>{selectedTask.category}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-sm flex font-medium capitalize ${getModuleColor(selectedTask.module)}`}>
              {getModuleIcon(selectedTask.module)}
              <span className="ml-1">{selectedTask.module}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getTaskTypeColor(selectedTask.taskType)}`}>
              {selectedTask.taskType.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.isActive)}`}>
              {selectedTask.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
              {selectedTask.durationMinutes} mins
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
              {selectedTask.points} points
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-lg">Title</h4>
            <p className="text-gray-700 text-lg">{selectedTask.title}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-lg">Instruction</h4>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">{selectedTask.instruction}</p>
            </div>
          </div>

          {selectedTask.content && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-lg">Content</h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-gray-700 text-sm leading-relaxed prose max-w-none" 
                     dangerouslySetInnerHTML={{ __html: selectedTask.content }} />
              </div>
            </div>
          )}

          {selectedTask.mediaUrl && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-lg">Media URL</h4>
              <a href={selectedTask.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {selectedTask.mediaUrl}
              </a>
            </div>
          )}

          {selectedTask.questions && selectedTask.questions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                Questions ({selectedTask.questions.length})
              </h4>
              <div className="space-y-4">
                {selectedTask.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white">
                    <h5 className="font-medium text-gray-900 mb-3 text-lg">Q{index + 1}: {question.question}</h5>
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${
                              option.id === question.correctAnswer
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium mr-2">{option.id}.</span>
                              <span>{option.text}</span>
                              {option.id === question.correctAnswer && (
                                <span className="ml-auto text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 text-sm text-gray-600 font-medium">
                      Points: {question.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Created by:</span> {selectedTask.createdBy?.name} ({selectedTask.createdBy?.email})
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Created at:</span> {new Date(selectedTask.createdAt!).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const categoryStats = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { total: 0, active: 0 };
    }
    acc[task.category].total++;
    if (task.isActive) {
      acc[task.category].active++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number }>);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Task Management</h2>
            <p className="text-gray-600 mt-2">Create and manage assessment tasks for all modules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-3 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Task</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter(prev => ({ ...prev, category: 'Basic' }))}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filter.category === 'Basic' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Basic Level
          </button>
          <button
            onClick={() => setFilter(prev => ({ ...prev, category: 'Advanced' }))}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filter.category === 'Advanced' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Advanced Level
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['listening', 'speaking', 'reading', 'writing'].map((module) => {
            // const activeTasks = tasks.filter(t => t.module === module && t.isActive).length;
            const totalTasks = tasks.filter(t => t.module === module).length;
            
            return (
              <div key={module} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`p-3 rounded-xl ${getModuleColor(module)}`}>
                    {getModuleIcon(module)}
                  </div>
                  <div>
                    <h4 className="font-bold text-center text-gray-900 capitalize text-lg">{module}</h4>
                    <div className="text-2xl font-bold text-center text-primary-600">
                     
                      <span className="text-sm text-gray-500 ml-2">{totalTasks}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">Total</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title or instruction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full lg:w-80"
                />
              </div>
              
              <button
                onClick={() => setAdvancedFilters(!advancedFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-400" />
                <span>Filters</span>
                {advancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
              {filter.category && ` for ${filter.category}`}
            </div>
          </div>

          {advancedFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select
                    value={filter.module}
                    onChange={(e) => setFilter(prev => ({ ...prev, module: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Modules</option>
                    <option value="listening">Listening</option>
                    <option value="speaking">Speaking</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="video_response">Video Response</option>
                    <option value="file_upload">File Upload</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilter({ category: 'Basic', module: 'all', type: 'all' })}
                    className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading tasks...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Title & Instruction</th>
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Module</th>
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Type</th>
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Duration</th>
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Points</th>
                      <th className="text-left py-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="max-w-md">
                            <div className="font-semibold text-gray-900 mb-1">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {task.instruction}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getModuleColor(task.module)}`}>
                            {task.module}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getTaskTypeColor(task.taskType)}`}>
                            {task.taskType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-gray-900">{task.durationMinutes}m</span>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-primary-600">{task.points}</span>
                        </td>
                        
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ 
                                show: true, 
                                taskId: task._id!, 
                                taskTitle: task.title
                              })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Task"
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

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No tasks found</p>
                  <p className="text-gray-500">
                    {searchTerm || filter.module !== 'all' || filter.type !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : `No tasks found for ${filter.category} level. Create your first task!`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAddModal && <AddTaskModal />}
      {editingTask && <EditTaskModal />}
      {selectedTask && <TaskDetailsModal />}
      <DeleteConfirmationModal />
    </Layout>
  );
}