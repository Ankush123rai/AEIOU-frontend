import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Camera, ChevronRight, CheckCircle, Clock, AlertCircle, Copyright } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/client';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../api/httpClient';

type Method = 'photo';

export function WritingModule() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    currentExam, 
    getExamAccess,
    loading 
  } = useExam();

  // Check access for current level
  const examAccess = level ? getExamAccess(level) : null;
  const hasAccess = examAccess?.hasAccess || false;
  const isCompleted = examAccess?.isCompleted || false;
  const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';

  // Fetch writing module tasks
  const { data: moduleData, isLoading: isModuleLoading } = useQuery({
    queryKey: ['writing-module', level],
    queryFn: async () => {
      const response = await httpClient.get(`exams/${formattedLevel}?module=Writing`);
      return response.data;
    },
    enabled: !!level && hasAccess,
  });

  // Get writing tasks from API response
  const writingModule = moduleData?.modulesWithTasks?.find(
    (module: any) => module.moduleName.toLowerCase() === 'writing'
  );

  const tasks = useMemo(() => {
    if (!writingModule?.availableTasks) return [];
    return writingModule.availableTasks.filter((task: any) => task.isActive !== false);
  }, [writingModule]);

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [uploadMethod, setUploadMethod] = useState<Method>('photo');
  const [isUploading, setIsUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(() => (writingModule?.durationMinutes || 10) * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp && !isUploading && !submitSuccess) {
      handleAutoSubmit();
    }
  }, [isTimeUp, isUploading, submitSuccess]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleFile = (taskId: string, f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }
    if (!f.type.startsWith('image/')) {
      alert('Upload an image (JPG/PNG/HEIC)');
      return;
    }
    setUploadedFiles(prev => ({ ...prev, [taskId]: f }));
  };

  const canSubmit = () => {
    if (uploadMethod === 'photo') {
      return tasks.every((t: any) => uploadedFiles[t._id]);
    }
    return false;
  };

  const handleAutoSubmit = async () => {
    if (!currentExam || !user || !level) return;
    
    // If nothing is uploaded, just submit empty responses
    if (!canSubmit()) {
      const responses = tasks.map((t: any) => ({
        taskId: t._id,
        answer: 'Time expired - No submission'
      }));

      try {
        const headers = {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        };

        await axios.post(
          `${API_BASE_URL}/api/submissions`,
          {
            examId: currentExam._id,
            module: "writing",
            responses,
          },
          headers
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("Auto-submit failed:", error);
      }
      return;
    }

    // Otherwise submit normally
    await submitNow();
  };

  const submitNow = async () => {
    if (!currentExam || !user || !level) return;
    
    // Check if all tasks are completed
    if (!canSubmit()) {
      const confirmSubmit = window.confirm(
        "You haven't uploaded files for all tasks. Do you want to submit anyway?"
      );
      if (!confirmSubmit) return;
    }

    setIsUploading(true);
    setSubmitError(null);

    try {
      if (uploadMethod === 'photo') {
        const formData = new FormData();
        formData.append('examLevel', formattedLevel);
        formData.append('module', 'writing');
        
        const responses = tasks.map((t: any) => ({
          taskId: t._id,
          answer: uploadedFiles[t._id] ? 'photo_uploaded' : 'no_photo'
        }));
        formData.append('responses', JSON.stringify(responses));
  
        // Append each file individually
        tasks.forEach((t: any) => {
          const file = uploadedFiles[t._id];
          if (file) {
            // Important: Use 'files[]' or 'files' as field name to match array field
            formData.append('files', file, file.name);
          }
        });
  
        // Debug: Check FormData contents
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
  
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(
          `${API_BASE_URL}/api/submissions`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Response:', response.data);
        
        setSubmitSuccess(true);
        setIsUploading(false);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error("Submit failed:", error);
      setIsUploading(false);
      setSubmitError(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to submit. Please try again."
      );
    }
  };

  // Check access and redirect if needed
  useEffect(() => {
    if (!loading && level && !hasAccess && !isCompleted) {
      navigate(`/exam/${level}`);
    }
  }, [loading, hasAccess, isCompleted, level, navigate]);

  if (loading || isModuleLoading) {
    return (
      <Layout>
        <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
            <div className="flex flex-col">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                  <span className="text-orange-500">AE</span>
                  <span className="text-blue-600">I</span>
                  <img
                    className="sm:w-7 sm:h-7 w-4 h-4"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                    alt="india"
                  />
                  <span className="text-green-500">U</span>
                  <Copyright className="p-1 relative bottom-2 right-1" />
                </div>
                <span className="sm:text-xs text-[8px] font-medium">
                  Assessment Of English In Our Union
                </span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading listening module...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Access Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to unlock this exam before accessing the writing module.
            </p>
            <button
              onClick={() => navigate(`/exam/${level}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              Back to Exam
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Writing Module">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Time Up Warning */}
        {isTimeUp && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Time's Up!</h3>
                <p className="text-red-700 text-sm">
                  Time limit reached. Submitting your assessment...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Status Messages */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">
                  Submission Successful!
                </h3>
                <p className="text-green-700 text-sm">
                  Your writing module has been submitted. Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-red-600">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">
                  Submission Failed
                </h3>
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="mt-2 text-red-600 text-sm font-medium hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header with Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Writing Assessment</h2>
              <p className="text-gray-600 mt-1">
                {tasks.length} writing task{tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                timeLeft < 60 ? 'bg-red-100 text-red-700' : 
                timeLeft < 300 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Time Warning Messages */}
          {timeLeft < 300 && timeLeft > 60 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm font-medium">
                  ⏰ Less than 5 minutes remaining!
                </p>
              </div>
            </div>
          )}

          {timeLeft <= 60 && timeLeft > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Less than 1 minute remaining! Submit now.
                </p>
              </div>
            </div>
          )}

          {/* Upload Method Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">Submission Method</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setUploadMethod('photo')}
                disabled={isUploading || submitSuccess || isTimeUp}
                className={`p-4 rounded-xl border-2 transition-all ${
                  uploadMethod === 'photo'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${(isUploading || submitSuccess || isTimeUp) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">Upload Photo</h4>
                  <p className="text-sm text-gray-600">Take a photo of your written response</p>
                </div>
              </button>
            </div>
          </div>

          {tasks.map((t: any, idx: number) => (
            <div
              key={t._id}
              className="border border-gray-200 rounded-xl p-6 mb-8 bg-gray-50"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {`${idx + 1}. ${t.title}`}
              </h3>
              <p className="whitespace-pre-line text-gray-800 leading-relaxed mb-6">
                {t.instruction}
              </p>

              {uploadMethod === 'photo' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    {uploadedFiles[t._id] ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {isUploading ? (
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-12 h-12 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs mx-auto">
                            {uploadedFiles[t._id]?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Ready to submit'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Size: {(uploadedFiles[t._id]!.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {!isUploading && !submitSuccess && !isTimeUp && (
                          <button
                            onClick={() => {
                              setUploadedFiles(prev => ({ ...prev, [t._id]: null }));
                              if (fileRefs.current[t._id]) {
                                fileRefs.current[t._id]!.value = '';
                              }
                            }}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove file
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <button
                          onClick={() => fileRefs.current[t._id]?.click()}
                          disabled={isUploading || submitSuccess || isTimeUp}
                          className="bg-blue-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isTimeUp ? 'Time Expired' : 'Choose File'}
                        </button>
                        <p className="mt-2 text-sm text-gray-600">
                          or drag and drop your image here
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: JPG, PNG, HEIC (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={(el) => (fileRefs.current[t._id] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(t._id, f);
                    }}
                    disabled={isUploading || submitSuccess || isTimeUp}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Progress and Time Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                <p className="text-lg font-bold">
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Progress</p>
                <p className="text-lg font-bold">
                  {uploadMethod === 'photo' 
                    && `${Object.keys(uploadedFiles).filter(k => uploadedFiles[k]).length}/${tasks.length} files uploaded`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {isTimeUp 
                ? 'Time limit reached. Assessment will be submitted automatically.'
                : 'Your response will be saved when you submit'
              }
            </div>
            <button
              onClick={submitNow}
              disabled={(!canSubmit() && !isTimeUp) || isUploading || submitSuccess}
              className="flex items-center space-x-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submitted!</span>
                </>
              ) : isTimeUp ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit & Complete</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}