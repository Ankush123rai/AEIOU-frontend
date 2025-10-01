// src/pages/modules/WritingModule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { Upload, Camera, FileText, Link as LinkIcon, ChevronRight, CheckCircle, Clock } from 'lucide-react';

export function WritingModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [textResponses, setTextResponses] = useState({});
  const [driveLinks, setDriveLinks] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text', 'photo', 'drive'
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentTask = tasks[currentTaskIndex];

  useEffect(() => {
    fetchExamData();
  }, []);

  useEffect(() => {
    let timer;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && tasks.length > 0) {
      handleSubmit();
    }

    return () => clearInterval(timer);
  }, [timeLeft, tasks]);

  const fetchExamData = async () => {
    try {
      const exams = await apiClient.fetchExams();
      const writingExam = exams.find(e => 
        e.modules.some(m => m.name === 'writing')
      );
      
      if (writingExam) {
        setExam(writingExam);
        const writingModule = writingExam.modules.find(m => m.name === 'writing');
        setTasks(writingModule.taskIds);
        setTimeLeft(writingModule.durationMinutes * 60);
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextResponseChange = (taskId, text) => {
    setTextResponses(prev => ({
      ...prev,
      [taskId]: text
    }));
  };

  const handleDriveLinkChange = (taskId, link) => {
    setDriveLinks(prev => ({
      ...prev,
      [taskId]: link
    }));
  };

  const handleFileUpload = (taskId, event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, HEIC)');
        return;
      }
      
      setUploadedFiles(prev => ({
        ...prev,
        [taskId]: file
      }));
    }
  };

  const nextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const responses = tasks.map(task => {
        let answer = '';
        
        switch (uploadMethod) {
          case 'text':
            answer = textResponses[task._id] || '';
            break;
          case 'photo':
            answer = uploadedFiles[task._id] ? 'Photo uploaded' : '';
            break;
          case 'drive':
            answer = driveLinks[task._id] || '';
            break;
        }
        
        return {
          taskId: task._id,
          answer: answer
        };
      });

      const formData = new FormData();
      formData.append('examId', exam._id);
      formData.append('module', 'writing');
      formData.append('responses', JSON.stringify(responses));

      // Add photo files if photo upload method
      if (uploadMethod === 'photo') {
        Object.entries(uploadedFiles).forEach(([taskId, file]) => {
          formData.append('files', file);
        });
      }

      await apiClient.submitModule(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting writing module:', error);
      alert('Error submitting responses. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = (text) => {
    return text ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  if (loading) {
    return (
      <Layout title="Writing Module">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        </div>
      </Layout>
    );
  }

  if (!exam || tasks.length === 0) {
    return (
      <Layout title="Writing Module">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-4">
              No Writing Test Available
            </h2>
            <p className="text-gray-600">Please check back later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Writing Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Writing Assessment</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-inter">
                Task {currentTaskIndex + 1} of {tasks.length}
              </span>
              <div className="flex items-center space-x-2 text-primary-700">
                <Clock className="w-5 h-5" />
                <span className="font-inter font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Task Description */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">
                {currentTask.question}
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-800 font-inter leading-relaxed whitespace-pre-line">
                  {currentTask.instructions || 'Please provide your written response to the question above.'}
                </p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> {currentTask.points} points | {currentTask.difficulty} difficulty
                </p>
              </div>
            </div>

            {/* Upload Method Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-poppins font-bold text-gray-900">Choose Response Method</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setUploadMethod('text')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    uploadMethod === 'text'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-center">
                    <h4 className="font-inter font-medium text-gray-900">Type Response</h4>
                    <p className="text-sm text-gray-600">Write directly in text area</p>
                  </div>
                </button>

                <button
                  onClick={() => setUploadMethod('photo')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    uploadMethod === 'photo'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Camera className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-center">
                    <h4 className="font-inter font-medium text-gray-900">Upload Photo</h4>
                    <p className="text-sm text-gray-600">Take photo of written work</p>
                  </div>
                </button>

                <button
                  onClick={() => setUploadMethod('drive')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    uploadMethod === 'drive'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LinkIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="text-center">
                    <h4 className="font-inter font-medium text-gray-900">Google Drive</h4>
                    <p className="text-sm text-gray-600">Share Drive link</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Response Input Based on Method */}
            <div className="space-y-6">
              {uploadMethod === 'text' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-poppins font-bold text-gray-900">
                      Your Written Response
                    </label>
                    <span className="text-sm text-gray-600 font-inter">
                      {wordCount(textResponses[currentTask._id])} words
                    </span>
                  </div>
                  <textarea
                    value={textResponses[currentTask._id] || ''}
                    onChange={(e) => handleTextResponseChange(currentTask._id, e.target.value)}
                    placeholder="Begin typing your response here..."
                    rows={12}
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                  />
                </div>
              )}

              {uploadMethod === 'photo' && (
                <div className="space-y-4">
                  <label className="text-lg font-poppins font-bold text-gray-900">
                    Upload Photo of Your Written Response
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    {uploadedFiles[currentTask._id] ? (
                      <div className="space-y-4">
                        <CheckCircle className="w-12 h-12 text-secondary-500 mx-auto" />
                        <div>
                          <p className="font-inter font-medium text-gray-900">
                            {uploadedFiles[currentTask._id].name}
                          </p>
                          <p className="text-sm text-gray-600">Ready to submit</p>
                        </div>
                        <button
                          onClick={() => document.getElementById(`file-input-${currentTask._id}`).click()}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Change File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <button
                          onClick={() => document.getElementById(`file-input-${currentTask._id}`).click()}
                          className="bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
                        >
                          Choose Photo
                        </button>
                        <p className="mt-2 text-sm text-gray-600">
                          or drag and drop your image here
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: JPG, PNG, HEIC (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    id={`file-input-${currentTask._id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(currentTask._id, e)}
                    className="hidden"
                  />
                </div>
              )}

              {uploadMethod === 'drive' && (
                <div className="space-y-4">
                  <label className="text-lg font-poppins font-bold text-gray-900">
                    Google Drive Link
                  </label>
                  <input
                    type="url"
                    value={driveLinks[currentTask._id] || ''}
                    onChange={(e) => handleDriveLinkChange(currentTask._id, e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                  />
                  <p className="text-sm text-gray-600 font-inter">
                    Make sure your document is shared with "Anyone with the link can view" permissions
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 font-inter">
              {getResponseStatus(currentTask._id)}
            </div>
            
            <button
              onClick={nextTask}
              disabled={!hasResponse(currentTask._id)}
              className="flex items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {currentTaskIndex === tasks.length - 1 
                  ? 'Submit All Responses' 
                  : 'Next Task'
                }
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

  function getResponseStatus(taskId) {
    switch (uploadMethod) {
      case 'text':
        return textResponses[taskId] 
          ? `${wordCount(textResponses[taskId])} words written`
          : 'No response written';
      case 'photo':
        return uploadedFiles[taskId] 
          ? 'Photo uploaded'
          : 'No photo uploaded';
      case 'drive':
        return driveLinks[taskId] 
          ? 'Drive link provided'
          : 'No drive link provided';
      default:
        return 'No response';
    }
  }

  function hasResponse(taskId) {
    switch (uploadMethod) {
      case 'text':
        return !!textResponses[taskId]?.trim();
      case 'photo':
        return !!uploadedFiles[taskId];
      case 'drive':
        return !!driveLinks[taskId]?.trim();
      default:
        return false;
    }
  }
}