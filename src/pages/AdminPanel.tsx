import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, BarChart3, TrendingUp, Clock, CheckCircle, BookOpen, Eye, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';
import { httpClient } from '../api/httpClient';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubmissions: number;
  pendingApprovals: number;
  activeExams: number;
  totalQuestions: number;
  moduleStats: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  submissionStats: {
    submitted: number;
    evaluated: number;
    pending: number;
  };
  weeklyActivity: Array<{
    day: string;
    submissions: number;
    registrations: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Question {
  _id: string;
  module: string;
  isActive: boolean;
}

interface Submission {
  _id: string;
  module: string;
  status: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface Exam {
  _id: string;
  isActive: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubmissions: 0,
    totalQuestions: 0,
    pendingApprovals: 0,
    activeExams: 0,
    moduleStats: { listening: 0, speaking: 0, reading: 0, writing: 0 },
    submissionStats: { submitted: 0, evaluated: 0, pending: 0 },
    weeklyActivity: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard stats from API
      const dashboardStats = await httpClient.get('admin/dashboard');
      
      // Fetch additional data needed for the dashboard
      const [users, questions, exams, submissions] = await Promise.all([
        httpClient.get('users').catch(() => []), // Fallback to empty array if endpoint not available
        httpClient.get('questions').catch(() => []),
        httpClient.get('exams/active').catch(() => []),
        httpClient.get('submissions').catch(() => [])
      ]);

      console.log("dashboardStats",dashboardStats)

      // Process users data
      const students = users.filter((u: User) => u.role === 'student');
      const teachers = users.filter((u: User) => u.role === 'teacher');
      const pendingUsers = users.filter((u: User) => u.status === 'pending');

      // Process questions by module
      const moduleStats = {
        listening: questions.filter((q: Question) => q.module === 'listening' && q.isActive).length,
        speaking: questions.filter((q: Question) => q.module === 'speaking' && q.isActive).length,
        reading: questions.filter((q: Question) => q.module === 'reading' && q.isActive).length,
        writing: questions.filter((q: Question) => q.module === 'writing' && q.isActive).length,
      };

      // Process submission stats
      const submissionStats = {
        submitted: submissions.filter((s: Submission) => s.status === 'submitted').length,
        evaluated: submissions.filter((s: Submission) => s.status === 'evaluated').length,
        pending: submissions.filter((s: Submission) => s.status === 'pending' || s.status === 'submitted').length,
      };

      // Generate weekly activity (last 7 days)
      const weeklyActivity = generateWeeklyActivity(submissions, users);
      
      // Generate recent activity from actual data
      const recentActivity = generateRecentActivity(users, submissions, exams);

      setStats({
        totalStudents: dashboardStats.totalStudents || students.length,
        totalTeachers: dashboardStats.totalTeachers || teachers.length,
        totalSubmissions: dashboardStats.totalSubmissions || submissions.length,
        totalQuestions: questions.length,
        pendingApprovals: pendingUsers.length,
        activeExams: exams.filter((e: Exam) => e.isActive).length,
        moduleStats,
        submissionStats,
        weeklyActivity,
        recentActivity
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyActivity = (submissions: Submission[], users: User[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];

      // Count submissions for this day
      const daySubmissions = submissions.filter((s: Submission) => 
        new Date(s.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      // Count registrations for this day
      const dayRegistrations = users.filter((u: User) => 
        new Date(u.createdAt).toISOString().split('T')[0] === dateStr
      ).length;

      weeklyActivity.push({
        day: dayName,
        submissions: daySubmissions,
        registrations: dayRegistrations
      });
    }

    return weeklyActivity;
  };

  const generateRecentActivity = (users: User[], submissions: Submission[], exams: Exam[]) => {
    const activities = [];
    
    // Add recent user registrations
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    
    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user_registration',
        description: `New ${user.role} registered: ${user.name}`,
        timestamp: user.createdAt
      });
    });

    // Add recent submissions
    const recentSubmissions = [...submissions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    
    recentSubmissions.forEach(submission => {
      activities.push({
        id: submission._id,
        type: 'submission',
        description: `${submission.module} test submitted${submission.user ? ` by ${submission.user.name}` : ''}`,
        timestamp: submission.createdAt
      });
    });

    // Add exam creation if available
    if (exams.length > 0) {
      const recentExam = [...exams]
        .sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())[0];
      
      if (recentExam) {
        activities.push({
          id: recentExam._id,
          type: 'exam_created',
          description: 'New exam created',
          timestamp: (recentExam as any).createdAt || new Date().toISOString()
        });
      }
    }

    // Sort by timestamp and return top 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };


  if (isLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="sm:text-3xl text-xl font-poppins font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-xs sm:text-base font-inter mt-1">Welcome to your administration panel</p>
          </div>
          <div className="sm:text-sm text-[8px] text-gray-500 font-inter flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Refresh Data
            </button>
            <span>|</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/users" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage students & teachers</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/questions" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Question Bank</h3>
                <p className="text-sm text-gray-600">Create & manage questions</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/exams" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Exam Management</h3>
                <p className="text-sm text-gray-600">Create assessments</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/submission" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Review Submissions</h3>
                <p className="text-sm text-gray-600">Evaluate student work</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Total Students</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-inter">
                {stats.weeklyActivity.reduce((acc, day) => acc + day.registrations, 0)} new this week
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Active Questions</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-xl">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Clock className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600 font-inter">Across 4 modules</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-sm text-yellow-600 font-inter">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Total Submissions</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalSubmissions}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-sm text-purple-600 font-inter">
                {stats.submissionStats.evaluated} evaluated
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
        </div>

      </div>
    </Layout>
  );
}