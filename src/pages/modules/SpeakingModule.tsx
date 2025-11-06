import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { ExamTask, useExam } from "../../hooks/useExam";
import { API_BASE_URL } from "../../services/api";
import axios from "axios";

export function SpeakingModule() {
  const { currentExam, getModule } = useExam();
  const navigate = useNavigate();

  const speakMod = getModule("speaking");
  const tasks = useMemo<ExamTask[]>(
    () => (speakMod?.taskIds || []).filter((t) => t.isActive !== false),
    [speakMod]
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State for multiple recordings - store both URL and Blob
  const [recordings, setRecordings] = useState<Record<number, { url: string; blob: Blob; duration: number }>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(300);
  const [hasPerm, setHasPerm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Camera permissions
  useEffect(() => {
    initializeCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      setHasPerm(true);
    } catch (e) {
      console.error("Camera access denied:", e);
      setHasPerm(false);
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
      const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
      ];

      const mimeType = possibleTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      if (!mimeType) {
        alert('Your browser does not support video recording. Please try Chrome or Firefox.');
        return;
      }

      const rec = new MediaRecorder(streamRef.current, { mimeType });
      const chunks: Blob[] = [];

      recorderRef.current = rec;
      
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      rec.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType });
          const videoURL = URL.createObjectURL(blob);
          setRecordings(prev => ({ 
            ...prev, 
            [currentTaskIdx]: { 
              url: videoURL, 
              blob,
              duration: recordingDuration
            } 
          }));
        }
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
        
        // Stop the camera stream when recording is done
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording timer
      setRecordingDuration(0);
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      // Set video source for live preview
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.error('Video play failed:', e));
      }

      rec.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Recording failed to start. Please reload the page and allow camera + mic permissions.');
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

    // Reinitialize camera for new recording
    await initializeCamera();
  };

  const nextTask = () => {
    if (currentTaskIdx < tasks.length - 1) {
      setCurrentTaskIdx((i) => i + 1);
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
    if (!currentExam) return;

    const allTasksCompleted = tasks.every((_, index) => isTaskCompleted(index));

    if (!allTasksCompleted) {
      alert("Please complete all speaking tasks before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("examId", currentExam._id);
      formData.append("module", "speaking");

      // Add all video files from recordings
      tasks.forEach((task, index) => {
        const recording = recordings[index];
        if (recording && recording.blob) {
          formData.append("files", recording.blob, `speaking-task-${index + 1}.webm`);
        }
      });

      // Include all task responses
      const responses = tasks.map((task, index) => ({
        taskId: task._id,
        answer: `Video response for ${task.title} - Duration: ${formatTime(recordings[index]?.duration || 0)}`,
      }));

      formData.append("responses", JSON.stringify(responses));

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

      console.log("Submission successful:", response.data);
      
      // Clean up URLs before navigating
      Object.values(recordings).forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url);
        }
      });
      
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Submission failed:", error);
      alert(error.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up on unmount
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Layout title="Speaking Assessment">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-bold mb-2">
              Speaking Assessment
            </h1>
            <p className="text-slate-700 text-xs font-inter opacity-90">
              Record your responses for each topic. You have 5 minutes per task.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-poppins font-bold">
                {formatTime(taskTimeLeft)}
              </span>
            </div>
            <p className="text-slate-700 text-xs">
              Time remaining for this task
            </p>
          </div>
        </div>

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
              {tasks.map((_, index) => (
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
                  <span className="text-sm font-inter text-blue-600 font-medium">
                    Task {currentTaskIdx + 1} of {tasks.length}
                  </span>
                  <h3 className="text-xl font-poppins font-bold text-gray-900">
                    {currentTask?.title || "Speaking Task"}
                  </h3>
                </div>
              </div>

              {currentTask?.instruction && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h4 className="font-inter font-semibold text-gray-900 mb-3">
                    Instructions
                  </h4>
                  <div className="text-gray-700 font-inter leading-relaxed whitespace-pre-line">
                    {currentTask.instruction}
                  </div>
                </div>
              )}

              {currentTask?.content && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-inter font-semibold text-gray-900 mb-3">
                    Content
                  </h4>
                  <div className="text-gray-700 font-inter leading-relaxed whitespace-pre-line">
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
              <h4 className="font-poppins font-bold text-gray-900 mb-4">
                Tips for Success
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-inter text-sm">
                    Speak clearly and at a moderate pace
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-inter text-sm">
                    Make eye contact with the camera
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-inter text-sm">
                    Use the full time to provide detailed responses
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded-full mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-inter text-sm">
                    Ensure good lighting and minimal background noise
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">
                {isRecording ? "Recording in Progress" : recordings[currentTaskIdx] ? "Recording Preview" : "Ready to Record"}
              </h3>

              <div className="bg-gray-900 rounded-xl overflow-hidden relative aspect-video">
                {hasPerm ? (
                  isRecording ? (
                    <div className="relative w-full h-full">
                      {/* Main content area - show task instructions or content */}
                      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-800 p-8">
                        <div className="text-center max-w-2xl">
                          <h3 className="text-2xl font-poppins font-bold mb-4">
                            {currentTask?.title}
                          </h3>
                          {currentTask?.content && (
                            <div className="text-lg font-inter leading-relaxed bg-gray-700 p-6 rounded-xl">
                              {currentTask.content}
                            </div>
                          )}
                          {currentTask?.instruction && (
                            <div className="text-gray-300 mt-4 text-sm">
                              {currentTask.instruction}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Small camera preview in corner */}
                      <div className="absolute bottom-6 right-6 w-48 h-36 bg-black rounded-lg border-2 border-white shadow-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          {formatTime(recordingDuration)}
                        </div>
                      </div>
                    </div>
                  ) : recordings[currentTaskIdx] ? (
                    <div className="relative w-full h-full">
                      <video
                        src={recordings[currentTaskIdx].url}
                        controls
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg">
                        <span className="text-sm font-medium">Duration: {formatTime(recordings[currentTaskIdx].duration)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-800">
                      <Camera className="w-16 h-16 mb-4 opacity-50" />
                      <p className="font-inter text-lg mb-2">Camera Ready</p>
                      <p className="text-gray-400 text-sm text-center">
                        Click "Start Recording" to begin<br />your speaking response
                      </p>
                    </div>
                  )
                ) : (
                  // Show permission denied message
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="font-inter text-lg mb-2">
                        Camera Access Required
                      </p>
                      <p className="text-gray-400 text-sm">
                        Please allow camera and microphone access to continue
                      </p>
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
                        className="flex items-center space-x-3 bg-red-600 text-white px-8 py-4 rounded-xl font-inter font-semibold hover:bg-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Mic className="w-5 h-5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center space-x-3 bg-gray-600 text-white px-8 py-4 rounded-xl font-inter font-semibold hover:bg-gray-700 transition-all transform hover:scale-105"
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
                      className="flex items-center space-x-3 bg-orange-500 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-orange-600 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-record</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Task Navigation */}
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
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next Task</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!isTaskCompleted() || isSubmitting}
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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