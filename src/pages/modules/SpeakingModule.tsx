import React, { useMemo, useRef, useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  Mic,
  Square,
  ChevronRight,
  Camera,
  CheckCircle,
  AlertCircle,
  Video,
  RefreshCw,
  Copyright,
  Upload,
} from "lucide-react";
import { useExam } from "../../context/ExamContext";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../services/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../api/httpClient";
import chakra from '../../assests/charka.png'
export function SpeakingModule() {
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

  // Fetch speaking module tasks
  const { data: moduleData, isLoading: isModuleLoading } = useQuery({
    queryKey: ['speaking-module', level],
    queryFn: async () => {
      const response = await httpClient.get(`exams/${formattedLevel}?module=Speaking`);
      return response.data;
    },
    enabled: !!level && hasAccess,
  });

  // Get speaking tasks from API response
  const speakingModule = moduleData?.modulesWithTasks?.find(
    (module: any) => module.moduleName.toLowerCase() === 'speaking'
  );

  const tasks = useMemo(() => {
    if (!speakingModule?.availableTasks) return [];
    return speakingModule.availableTasks.filter((task: any) => task.isActive !== false);
  }, [speakingModule]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [recordings, setRecordings] = useState<Record<number, { url: string; blob: Blob; duration: number; fileName: string }>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(300);
  const [hasPerm, setHasPerm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const currentTask = tasks[currentTaskIdx];

  // Timer effect for task time
  useEffect(() => {
    if (!currentTask || isSubmitting) return;

    const timer = setInterval(() => {
      setTaskTimeLeft((prev) => {
        if (prev <= 1) {
          if (isRecording) stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTask, isRecording, isSubmitting]);

  // Reset for new task
  useEffect(() => {
    setTaskTimeLeft(300);
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  }, [currentTaskIdx]);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();
    
    return () => {
      cleanupCamera();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Stop any existing stream first
      cleanupCamera();
      
      const constraints = {
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPerm(true);
      setCameraError(null);
      
      // Update video element with new stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(e => console.error('Video play failed:', e));
      }
      
    } catch (e: any) {
      console.error("Camera access denied:", e);
      setHasPerm(false);
      setCameraError(e.message || 'Failed to access camera');
    }
  };

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await initializeCamera();
      if (!streamRef.current) {
        alert('Please allow camera and microphone access to record your response.');
        return;
      }
    }
  
    try {
      // Clear any existing chunks
      const chunks: BlobPart[] = [];
      
      // Ensure video element has the stream
      if (videoRef.current && streamRef.current) {
        if (!videoRef.current.srcObject) {
          videoRef.current.srcObject = streamRef.current;
        }
        await videoRef.current.play();
      }
  
      // Simple MIME type that's widely supported
      const mimeType = 'video/webm';
      
      const rec = new MediaRecorder(streamRef.current);
      recorderRef.current = rec;
      
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
  
      rec.onstop = async () => {
        
        if (chunks.length > 0) {
          try {
            // Create a fresh blob with all chunks
            const blob = new Blob(chunks, { type: mimeType });
            
            // Validate blob
            if (blob.size > 0) {
              const videoURL = URL.createObjectURL(blob);
              const fileName = `speaking-task-${currentTaskIdx + 1}-${Date.now()}.webm`;
              
              
              setRecordings(prev => ({ 
                ...prev, 
                [currentTaskIdx]: { 
                  url: videoURL, 
                  blob,
                  duration: recordingDuration,
                  fileName
                } 
              }));
            } else {
              console.error('❌ Created blob has 0 size');
            }
          } catch (blobError) {
            console.error('❌ Error creating blob:', blobError);
          }
        } else {
          console.error('❌ No chunks available for blob creation');
        }
        
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
      };
  
      // Start recording timer
      setRecordingDuration(0);
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          return newDuration;
        });
      }, 1000);
      setRecordingTimer(timer);
  
      // Start recording with a timeslice
      rec.start(1000);
      setIsRecording(true);
      
      
    } catch (error: any) {
      console.error('❌ Error starting recording:', error);
      alert('Recording failed to start. Please try again.');
    }
  };
  
  const stopRecording = () => {
   
    
    if (recorderRef.current && isRecording && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const retryRecording = async () => {
    if (recordings[currentTaskIdx]?.url) {
      URL.revokeObjectURL(recordings[currentTaskIdx].url);
    }
    
    setRecordings(prev => {
      const newRecordings = { ...prev };
      delete newRecordings[currentTaskIdx];
      return newRecordings;
    });
    setIsRecording(false);
    setRecordingDuration(0);
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }

    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }

    // Reinitialize camera
    await initializeCamera();
  };

  const nextTask = () => {
    // Clean up current camera
    cleanupCamera();
    
    if (currentTaskIdx < tasks.length - 1) {
      setCurrentTaskIdx((i) => i + 1);
      // Reinitialize camera for next task
      setTimeout(() => initializeCamera(), 500);
    } else {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isTaskCompleted = (taskIndex = currentTaskIdx) => {
    return recordings[taskIndex] !== undefined;
  };

  const getTaskProgress = () => {
    const completedTasks = tasks.filter((_, index) => isTaskCompleted(index)).length;
    return (completedTasks / tasks.length) * 100;
  };

  const handleSubmit = async () => {
    if (!currentExam || !user || !level) return;
  
    // Check if we have any recordings
    const hasAnyRecordings = Object.keys(recordings).length > 0;
    
    if (!hasAnyRecordings) {
      alert('No recordings found. Please record at least one task before submitting.');
      return;
    }
  
    setIsSubmitting(true);
    setUploadProgress(0);
    
    // Clean up camera before submission
    cleanupCamera();
  
    try {
      const formData = new FormData();
      formData.append("examLevel", formattedLevel);
      formData.append("module", "speaking");

      let fileCount = 0;
      
      // Loop through all indices in recordings
      for (const taskIndexStr in recordings) {
        const taskIndex = parseInt(taskIndexStr);
        const recording = recordings[taskIndex];
        
        
        if (recording && recording.blob) {
          // Create a fresh File object from the blob
          try {
            const file = new File(
              [recording.blob], 
              recording.fileName || `speaking-task-${taskIndex + 1}.webm`,
              { type: recording.blob.type || 'video/webm' }
            );
            
           
            // Append to FormData
            formData.append("files", file);
            fileCount++;
            
            
          } catch (fileError) {
            console.error(`❌ Error creating File object:`, fileError);
          }
        }
      }
  
  
      if (fileCount === 0) {
        throw new Error('No valid video files found. Please record again.');
      }
  
      // Create responses array
      const responses = tasks.map((task: any, index: number) => {
        const recording = recordings[index];
        return {
          taskId: task._id,
          answer: recording 
            ? `Video response - ${formatTime(recording.duration || 1)}`
            : 'No response'
        };
      });
  
      formData.append("responses", JSON.stringify(responses));
  
      // Verify FormData has files
      let foundFiles = false;
      for (let [key, value] of formData.entries()) {
        if (key === 'files' && value instanceof File) {
          foundFiles = true;
        }
      }
      
      if (!foundFiles) {
        throw new Error('FormData does not contain any files');
      }
  
      const token = localStorage.getItem('auth_token');
      
      // Use fetch API instead of axios for better debugging
      
      const response = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary
        },
        body: formData
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed');
      }
      
      // Clean up URLs
      Object.values(recordings).forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url);
        }
      });
      
      // Navigate on success
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error('❌ Submission failed:', error);
      alert(error.message || 'Submission failed. Please try again.');
      
      // Reinitialize camera
      await initializeCamera();
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(recordings).forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url);
        }
      });
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      
      cleanupCamera();
    };
  }, []);

  // Check access and redirect if needed
  useEffect(() => {
    if (!loading && level && !hasAccess && !isCompleted) {
      navigate(`/exam/${level}`);
    }
  }, [loading, hasAccess, isCompleted, level, navigate]);

  // Add a test upload function
  const testUpload = async () => {
    try {
      // Create a small test file
      const testContent = new ArrayBuffer(1024); // 1KB test file
      const testBlob = new Blob([testContent], { type: 'video/webm' });
      
      const formData = new FormData();
      formData.append('examLevel', formattedLevel);
      formData.append('module', 'speaking');
      formData.append('files', testBlob, 'test-file.webm');
      formData.append('responses', JSON.stringify([{ 
        taskId: 'test-task-id', 
        answer: 'Test response' 
      }]));

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
      
      alert('Test upload successful! Check console for details.');
    } catch (error: any) {
      console.error('❌ Test upload failed:', error.response?.data || error.message);
      alert('Test upload failed. Check console for error details.');
    }
  };

  if (loading || isModuleLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="flex flex-col">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                  <span className="text-orange-500">AE</span>
                  <span className="text-blue-600">I</span>
                  <img
                    className="sm:w-7 sm:h-7 w-4 h-4"
                    src={chakra}
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
              Loading speaking module...
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
              You need to unlock this exam before accessing the speaking module.
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
    <Layout title="Speaking Assessment">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Test Button (temporary - remove in production) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-yellow-800 font-medium">Debug Mode</p>
              <p className="text-yellow-700 text-sm">Test upload functionality</p>
            </div>
            <button
              onClick={testUpload}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
            >
              Test Upload
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Speaking Assessment
            </h1>
            <p className="text-slate-700 text-xs opacity-90">
              Record your responses for each topic. You have 5 minutes per task.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-bold">
                {formatTime(taskTimeLeft)}
              </span>
            </div>
            <p className="text-slate-700 text-xs">
              Time remaining for this task
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between text-sm text-blue-800 mb-1">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Task Progress</span>
                <span>{Object.keys(recordings).length} of {tasks.length} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTaskProgress()}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-4 flex space-x-1">
              {tasks.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full border-2 ${
                    isTaskCompleted(index)
                      ? 'bg-green-500 border-green-600'
                      : index === currentTaskIdx
                      ? 'bg-blue-500 border-blue-600'
                      : 'bg-gray-300 border-gray-400'
                  }`}
                  title={`Task ${index + 1} - ${isTaskCompleted(index) ? 'Completed' : 'Pending'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm text-blue-600 font-medium">
                    Task {currentTaskIdx + 1} of {tasks.length}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentTask?.title || "Speaking Task"}
                  </h3>
                </div>
              </div>

              {currentTask?.instruction && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Instructions
                  </h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentTask.instruction}
                  </div>
                </div>
              )}

              {currentTask?.content && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Content
                  </h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentTask.content}
                  </div>
                </div>
              )}

              {currentTask?.mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
                  <img
                    src={currentTask.mediaUrl}
                    alt="Task visual"
                    className="w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">
                Tips for Success
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Speak clearly and at a moderate pace
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Make eye contact with the camera
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Use the full time to provide detailed responses
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">
                    Ensure good lighting and minimal background noise
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isRecording ? "Recording in Progress" : recordings[currentTaskIdx] ? "Recording Preview" : "Ready to Record"}
              </h3>

              <div className="rounded-xl overflow-hidden relative aspect-video bg-black">
                {hasPerm ? (
                  <div className="relative w-full h-full">
                    {/* Live camera feed */}
                    {(!recordings[currentTaskIdx] || isRecording) && (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Recording indicator */}
                    {isRecording && (
                      <>
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">REC</span>
                          <span className="text-sm">{formatTime(recordingDuration)}</span>
                        </div>
                        
                        {/* Task content overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="text-center text-white max-w-2xl p-4">
                            <h3 className="text-xl font-bold mb-2">{currentTask?.title}</h3>
                            {currentTask?.content && (
                              <div className="text-lg leading-relaxed">
                                {currentTask.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Playback of recorded video */}
                    {recordings[currentTaskIdx] && !isRecording && (
                      <>
                        <video
                          ref={previewVideoRef}
                          src={recordings[currentTaskIdx].url}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">
                            Duration: {formatTime(recordings[currentTaskIdx].duration)}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Camera ready view when no recording exists */}
                    {!recordings[currentTaskIdx] && !isRecording && (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Camera className="w-16 h-16 mb-4 text-white opacity-70" />
                        <p className="text-lg text-white mb-2">Camera Ready</p>
                        <p className="text-gray-300 text-sm text-center">
                          Click "Start Recording" to begin<br />your speaking response
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Camera Access Required</p>
                      <p className="text-gray-400 text-sm mb-4">
                        {cameraError || "Please allow camera and microphone access to continue"}
                      </p>
                      <button
                        onClick={initializeCamera}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Request Permission
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4 mt-6">
                {!isTaskCompleted() ? (
                  <>
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={!hasPerm || taskTimeLeft === 0}
                        className="flex items-center space-x-3 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Mic className="w-5 h-5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center space-x-3 bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all transform hover:scale-105"
                      >
                        <Square className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex space-x-4">
                    <button
                      onClick={retryRecording}
                      className="flex items-center space-x-3 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-record</span>
                    </button>
                    {recordings[currentTaskIdx] && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span>{(recordings[currentTaskIdx].blob.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {isTaskCompleted() ? (
                    <span className="text-green-600 font-medium flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready to continue</span>
                    </span>
                  ) : (
                    <span className="text-orange-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Record your response to continue</span>
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  {currentTaskIdx < tasks.length - 1 ? (
                    <button
                      onClick={nextTask}
                      disabled={!isTaskCompleted()}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next Task</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit All</span>
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </Layout>
  );
}