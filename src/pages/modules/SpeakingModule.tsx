// src/pages/modules/SpeakingModule.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { Video, Mic, Square, Play, Clock, ChevronRight, Camera, Upload } from 'lucide-react';

export function SpeakingModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [exam, setExam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [driveLinks, setDriveLinks] = useState({});
  const [uploadMethod, setUploadMethod] = useState('record'); // 'record' or 'drive'
  const [loading, setLoading] = useState(true);

  const currentTask = tasks[currentTaskIndex];

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const exams = await apiClient.fetchExams();
      const speakingExam = exams.find(e => 
        e.modules.some(m => m.name === 'speaking')
      );
      
      if (speakingExam) {
        setExam(speakingExam);
        const speakingModule = speakingExam.modules.find(m => m.name === 'speaking');
        setTasks(speakingModule.taskIds);
        setTimeLeft(speakingModule.durationMinutes * 60);
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Please allow camera and microphone access to continue with the speaking test.');
    }
  };

  const startRecording = async () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        setRecordedVideos(prev => ({
          ...prev,
          [currentTask._id]: { blob, url }
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error starting recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDriveLinkChange = (taskId, link) => {
    setDriveLinks(prev => ({
      ...prev,
      [taskId]: link
    }));
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
        if (uploadMethod === 'record') {
          const recordedVideo = recordedVideos[task._id];
          return {
            taskId: task._id,
            answer: recordedVideo ? 'Video recorded' : 'No video recorded'
          };
        } else {
          return {
            taskId: task._id,
            answer: driveLinks[task._id] || ''
          };
        }
      });

      const formData = new FormData();
      formData.append('examId', exam._id);
      formData.append('module', 'speaking');
      formData.append('responses', JSON.stringify(responses));

      // Add video files if recording method
      if (uploadMethod === 'record') {
        Object.entries(recordedVideos).forEach(([taskId, video]) => {
          const file = new File([video.blob], `speaking-task-${taskId}.webm`, {
            type: 'video/webm'
          });
          formData.append('files', file);
        });
      }

      await apiClient.submitModule(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting speaking module:', error);
      alert('Error submitting responses. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout title="Speaking Module">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        </div>
      </Layout>
    );
  }

  if (!exam || tasks.length === 0) {
    return (
      <Layout title="Speaking Module">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-poppins font-bold text-gray-900 mb-4">
              No Speaking Test Available
            </h2>
            <p className="text-gray-600">Please check back later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Speaking Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Speaking Assessment</h2>
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

          {/* Upload Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Response Method:
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadMethod('record')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  uploadMethod === 'record'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Record Video
              </button>
              <button
                onClick={() => setUploadMethod('drive')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  uploadMethod === 'drive'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Google Drive Link
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">
                  {currentTask.question}
                </h3>
                <p className="text-gray-700 font-inter leading-relaxed">
                  {currentTask.instructions || 'Please record your response to the question above.'}
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> {currentTask.points} points | {currentTask.difficulty} difficulty
                  </p>
                </div>
              </div>

              {uploadMethod === 'record' && (
                <div className="flex justify-center space-x-4">
                  {!hasPermission ? (
                    <button
                      onClick={requestPermissions}
                      className="flex items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Enable Camera & Microphone</span>
                    </button>
                  ) : !isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-red-700 transition-colors"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-gray-700 transition-colors"
                    >
                      <Square className="w-5 h-5" />
                      <span>Stop Recording</span>
                    </button>
                  )}
                </div>
              )}

              {uploadMethod === 'drive' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Google Drive Link for this task:
                  </label>
                  <input
                    type="url"
                    value={driveLinks[currentTask._id] || ''}
                    onChange={(e) => handleDriveLinkChange(currentTask._id, e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600">
                    Make sure your video is shared with "Anyone with the link can view" permissions
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {uploadMethod === 'record' && (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  {hasPermission ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-inter">Camera access required</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recorded Video Preview */}
              {uploadMethod === 'record' && recordedVideos[currentTask._id] && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Recorded Response:</h4>
                  <video
                    src={recordedVideos[currentTask._id].url}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="text-center">
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="font-inter font-medium">Recording...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 font-inter">
              {uploadMethod === 'record' 
                ? (recordedVideos[currentTask._id] ? 'Response recorded' : 'No response recorded')
                : (driveLinks[currentTask._id] ? 'Drive link provided' : 'No drive link provided')
              }
            </div>
            
            <button
              onClick={nextTask}
              disabled={
                (uploadMethod === 'record' && !recordedVideos[currentTask._id]) ||
                (uploadMethod === 'drive' && !driveLinks[currentTask._id])
              }
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
}