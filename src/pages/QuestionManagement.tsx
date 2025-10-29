import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter, Upload, Video, Headphones, BookOpen, Mic, PenTool, X, Save } from 'lucide-react';
import { apiClient } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface QuestionOption {
  id: string;
  text: string;
}

interface TaskQuestion {
  _id?: string;
  question: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  questionType: 'multiple_choice' | 'text_response' | 'file_upload' | 'video_response';
}

interface Task {
  _id?: string;
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

export function QuestionManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getTasks();
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
    const matchesModule = filterModule === 'all' || task.module === filterModule;
    const matchesType = filterType === 'all' || task.taskType === filterType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  const handleAddTask = async (taskData: any) => {
    try {
      setError(null);
      await apiClient.createTask(taskData);
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
      await apiClient.updateTask(taskId, taskData);
      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setError(null);
        await apiClient.deleteTask(taskId);
        await loadTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
        setError('Failed to delete task. Please try again.');
      }
    }
  };
  const handleToggleActive = async (taskId: string, isActive: boolean) => {
    try {
      setError(null);
      await apiClient.toggleTaskActive(taskId, !isActive);
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      setError('Failed to update task status. Please try again.');
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
      case 'multiple_choice': return 'text-blue-600 bg-blue-50';
      case 'video_response': return 'text-purple-600 bg-purple-50';
      case 'file_upload': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const AddTaskModal = () => {
    const [formData, setFormData] = useState({
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Create New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instruction *</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-inter"
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

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
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


  // EditTaskModal Component
  const EditTaskModal = () => {
    if (!editingTask) return null;

    const [formData, setFormData] = useState({
      title: editingTask.title,
      module: editingTask.module,
      taskType: editingTask.taskType,
      instruction: editingTask.instruction,
      content: editingTask.content || '',
      imageUrl: editingTask.imageUrl || '',
      mediaUrl: editingTask.mediaUrl || '',
      durationMinutes: editingTask.durationMinutes,
      points: editingTask.points,
      maxFiles: editingTask.maxFiles || 1,
      maxFileSize: editingTask.maxFileSize || 100,
      questions: editingTask.questions.map(q => ({
        ...q,
        options: q.options || [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' }
        ]
      }))
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-poppins font-bold text-gray-900">Edit Task</h3>
            <button
              onClick={() => setEditingTask(null)}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instruction *</label>
              <textarea
                value={formData.instruction}
                onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-inter"
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

<div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">Task Details</h3>
          <button
            onClick={() => setSelectedTask(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(selectedTask.module)}`}>
              {selectedTask.module}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTaskTypeColor(selectedTask.taskType)}`}>
              {selectedTask.taskType.replace('_', ' ')}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {selectedTask.durationMinutes} mins
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {selectedTask.points} points
            </span>
          </div>

          <div>
            <h4 className="font-inter font-medium text-gray-900 mb-2">Title</h4>
            <p className="text-gray-700 font-inter">{selectedTask.title}</p>
          </div>

          <div>
            <h4 className="font-inter font-medium text-gray-900 mb-2">Instruction</h4>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 font-inter whitespace-pre-line">{selectedTask.instruction}</p>
            </div>
          </div>

          {selectedTask.content && (
            <div>
              <h4 className="font-inter font-medium text-gray-900 mb-2">Content</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 font-inter text-sm leading-relaxed">{selectedTask.content}</p>
              </div>
            </div>
          )}

          {selectedTask.mediaUrl && (
            <div>
              <h4 className="font-inter font-medium text-gray-900 mb-2">Media URL</h4>
              <a href={selectedTask.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {selectedTask.mediaUrl}
              </a>
            </div>
          )}

          {selectedTask.questions && selectedTask.questions.length > 0 && (
            <div>
              <h4 className="font-inter font-medium text-gray-900 mb-2">Questions ({selectedTask.questions.length})</h4>
              <div className="space-y-4">
                {selectedTask.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Q{index + 1}: {question.question}</h5>
                    {question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-lg ${
                              option.id === question.correctAnswer
                                ? 'border border-green-200 bg-green-50 text-green-800'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{option.id}.</span> {option.text}
                            {option.id === question.correctAnswer && (
                              <span className="ml-2 text-xs text-green-600 font-medium">(Correct Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-600">
                      Points: {question.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Created by: {selectedTask.createdBy?.name} ({selectedTask.createdBy?.email})
            </div>
            <div className="text-sm text-gray-600">
              Created at: {new Date(selectedTask.createdAt!).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Task Management">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Task Management</h2>
            <p className="text-gray-600 font-inter">Create and manage assessment tasks for all modules</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Module Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['listening', 'speaking', 'reading', 'writing'].map((module) => (
            <div key={module} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${getModuleColor(module)}`}>
                  {getModuleIcon(module)}
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-gray-900 capitalize">{module}</h4>
                  <div className="text-2xl font-poppins font-bold text-primary-600">
                    {tasks.filter(t => t.module === module && t.isActive).length}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-inter">Active Tasks</div>
            </div>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                >
                  <option value="all">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="video_response">Video Response</option>
                  <option value="file_upload">File Upload</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 font-inter">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>

          <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Module</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Duration</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Points</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Questions</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4">
                          <div className="max-w-xs">
                            <div className="font-inter font-medium text-gray-900 truncate">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-600 font-inter truncate">
                              {task.instruction.substring(0, 60)}...
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getModuleColor(task.module)}`}>
                            {task.module}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTaskTypeColor(task.taskType)}`}>
                            {task.taskType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter text-gray-900">{task.durationMinutes}m</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter font-medium text-gray-900">{task.points}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-inter text-gray-600">{task.questions?.length || 0}</span>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleActive(task._id!, task.isActive)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.isActive
                                ? 'text-green-600 bg-green-50'
                                : 'text-gray-600 bg-gray-50'
                            }`}
                          >
                            {task.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id!)}
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

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">No tasks found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddTaskModal />}
      {editingTask && <EditTaskModal />}
      {selectedTask && <TaskDetailsModal />}
    </Layout>
  );
}