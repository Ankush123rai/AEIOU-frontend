import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Play, Pause, RotateCcw, Clock, ChevronRight } from 'lucide-react';

export function ListeningModule() {
  const navigate = useNavigate();
  const { updateProgress } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

  const questions = [
    {
      id: 1,
      question: "What is the main topic of the conversation?",
      options: [
        "Planning a vacation",
        "Discussing work schedules",
        "Talking about the weather",
        "Organizing a meeting"
      ]
    },
    {
      id: 2,
      question: "When does the meeting take place?",
      options: [
        "Next Monday at 9 AM",
        "Tomorrow at 2 PM",
        "This Friday at 3 PM",
        "Next week Thursday"
      ]
    },
    {
      id: 3,
      question: "How many people will attend the meeting?",
      options: [
        "5 people",
        "7 people",
        "10 people",
        "12 people"
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    const completedQuestions = Object.keys(answers).length;
    const progress = Math.round((completedQuestions / questions.length) * 100);
    updateProgress('listening', progress);
    navigate('/dashboard');
  };

  return (
    <Layout title="Listening Module">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-poppins font-bold text-gray-900">Listening Assessment</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-primary-700">
                <Clock className="w-5 h-5" />
                <span className="font-inter font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Audio Player</h3>
                
                <audio
                  ref={audioRef}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                >
                  <source src="/audio/listening-test.mp3" type="audio/mpeg" />
                </audio>

                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 font-inter">
                    <span>{formatTime(Math.floor(currentTime))}</span>
                    <span>{formatTime(Math.floor(duration))}</span>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={restartAudio}
                      className="p-3 text-gray-600 hover:text-primary-700 transition-colors"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                    <button
                      onClick={toggleAudio}
                      className="p-4 bg-primary-900 text-white rounded-full hover:bg-primary-800 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-poppins font-bold text-gray-900">Questions</h3>
              
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-inter font-medium text-gray-900 mb-4">
                    {index + 1}. {question.question}
                  </h4>
                  
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={(e) => handleAnswerSelect(index, e.target.value)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-inter text-gray-700 group-hover:text-gray-900">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-600 font-inter">
              Question {Object.keys(answers).length} of {questions.length} answered
            </div>
            
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
            >
              <span>Submit & Continue</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}