// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Headphones, Mic, BookOpen, PenTool, HelpCircle, Lock, CheckCircle, Play, Award, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsData, examsData] = await Promise.all([
        apiClient.fetchMySubmissions(),
        apiClient.fetchExams()
      ]);
      setSubmissions(submissionsData);
      setExams(examsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleName) => {
    const moduleSubmissions = submissions.filter(sub => sub.module === moduleName);
    return moduleSubmissions.length > 0 ? 100 : 0;
  };

  const isModuleCompleted = (moduleName) => {
    return submissions.some(sub => sub.module === moduleName);
  };

  const modules = [
    {
      id: 'listening',
      name: 'Listening',
      icon: <Headphones className="w-8 h-8" />,
      progress: getModuleProgress('listening'),
      completed: isModuleCompleted('listening'),
      description: 'Test your comprehension skills with audio passages',
      duration: '20 mins',
      questions: 15,
      color: 'blue',
    },
    {
      id: 'speaking',
      name: 'Speaking',
      icon: <Mic className="w-8 h-8" />,
      progress: getModuleProgress('speaking'),
      completed: isModuleCompleted('speaking'),
      description: 'Record video responses to demonstrate speaking skills',
      duration: '15 mins',
      questions: 3,
      color: 'green',
    },
    {
      id: 'reading',
      name: 'Reading',
      icon: <BookOpen className="w-8 h-8" />,
      progress: getModuleProgress('reading'),
      completed: isModuleCompleted('reading'),
      description: 'Evaluate reading comprehension and vocabulary',
      duration: '25 mins',
      questions: 20,
      color: 'purple',
    },
    {
      id: 'writing',
      name: 'Writing',
      icon: <PenTool className="w-8 h-8" />,
      progress: getModuleProgress('writing'),
      completed: isModuleCompleted('writing'),
      description: 'Type responses or upload photos of handwritten work',
      duration: '30 mins',
      questions: 2,
      color: 'orange',
    },
  ];

  const overallProgress = Math.round(
    modules.reduce((total, module) => total + module.progress, 0) / modules.length
  );

  const completedModules = modules.filter(module => module.completed).length;
  const totalModules = modules.length;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {completedModules === totalModules && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <Award className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600 font-inter max-w-md mx-auto">
            {completedModules === totalModules 
              ? "Congratulations! You've completed all modules. 🎉"
              : "Continue your language assessment journey"
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-poppins font-semibold text-gray-900">Overall Progress</h3>
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                  <span className="text-2xl font-poppins font-bold text-primary-900">{overallProgress}%</span>
                </div>
                <svg className="w-24 h-24 absolute top-0 left-0 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="url(#progress-gradient)"
                    strokeWidth="4"
                    strokeDasharray={`${(overallProgress / 100) * 276.32} 276.32`}
                    strokeLinecap="round"
                  />
                </svg>
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-inter">
                {completedModules} of {totalModules} modules completed
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-poppins font-semibold text-gray-900">Completion Status</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      module.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {module.completed ? <CheckCircle className="w-4 h-4" /> : module.icon}
                    </div>
                    <span className="font-inter text-sm font-medium text-gray-900">{module.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    module.completed 
                      ? 'bg-green-100 text-green-800' 
                      : module.progress > 0 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {module.completed ? 'Completed' : module.progress > 0 ? 'In Progress' : 'Not Started'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-poppins font-semibold text-gray-900">Quick Actions</h3>
              <Play className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-3">
              <button 
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-xl font-inter font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => window.location.href = '/module/listening'}
              >
                Start Assessment
              </button>
              <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-xl font-inter font-medium transition-all duration-200">
                View Results
              </button>
              <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-xl font-inter font-medium transition-all duration-200">
                Practice Tests
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Modules */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-poppins font-bold text-gray-900">Assessment Modules</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>Locked</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                index={index}
                submissions={submissions}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button className="flex items-center space-x-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-inter font-medium transition-all duration-200 hover:shadow-md">
            <HelpCircle className="w-5 h-5" />
            <span>Need Help? View FAQ & Support</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}

const ModuleCard = ({ module, index, submissions }) => {
  const isCompleted = submissions.some(sub => sub.module === module.id);

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-md animate-slide-up ${
        isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-gray-100'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          isCompleted
            ? 'bg-green-100 text-green-600'
            : `bg-${module.color}-100 text-${module.color}-600`
        }`}>
          {isCompleted ? <CheckCircle className="w-6 h-6" /> : module.icon}
        </div>
        {isCompleted ? (
          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Done</span>
          </div>
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>

      <h4 className="text-lg font-poppins font-bold text-gray-900 mb-2">
        {module.name}
      </h4>
      <p className="text-gray-600 text-sm font-inter mb-4">
        {module.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{module.duration}</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen className="w-3 h-3" />
          <span>{module.questions} questions</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{module.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-green-500'
                : module.progress > 0
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
            style={{ width: `${module.progress}%` }}
          />
        </div>
      </div>

      <button
        className={`w-full py-3 px-4 rounded-xl font-inter font-medium transition-all duration-200 ${
          isCompleted
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        } transform hover:scale-[1.02] active:scale-[0.98]`}
        onClick={() => {
          if (!isCompleted) {
            window.location.href = `/module/${module.id}`;
          }
        }}
      >
        {isCompleted ? (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Start</span>
          </div>
        )}
      </button>
    </div>
  );
};

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);