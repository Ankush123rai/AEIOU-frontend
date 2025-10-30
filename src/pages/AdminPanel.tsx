
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, BarChart3, TrendingUp, Clock, CheckCircle, BookOpen, Eye } from 'lucide-react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalQuestions: number;
  pendingApprovals: number;
  activeExams: number;
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
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    pendingApprovals: 0,
    activeExams: 0,
    moduleStats: { listening: 0, speaking: 0, reading: 0, writing: 0 },
    submissionStats: { submitted: 0, evaluated: 0, pending: 0 },
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [users, questions, exams, submissions] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getTasks(),
        apiClient.getActiveExams(),
        apiClient.getSubmissions().catch(() => []) // Handle if submissions endpoint not available
      ]);

      const students = users.filter((u: any) => u.role === 'student');
      const teachers = users.filter((u: any) => u.role === 'teacher');
      const pendingUsers = users.filter((u: any) => u.status === 'pending');

      const moduleStats = {
        listening: questions.filter((q: any) => q.module === 'listening' && q.isActive).length,
        speaking: questions.filter((q: any) => q.module === 'speaking' && q.isActive).length,
        reading: questions.filter((q: any) => q.module === 'reading' && q.isActive).length,
        writing: questions.filter((q: any) => q.module === 'writing' && q.isActive).length,
      };

      const submissionStats = {
        submitted: submissions.filter((s: any) => s.status === 'submitted').length,
        evaluated: submissions.filter((s: any) => s.status === 'evaluated').length,
        pending: submissions.filter((s: any) => s.status === 'submitted').length,
      };

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalQuestions: questions.length,
        pendingApprovals: pendingUsers.length,
        activeExams: exams.length,
        moduleStats,
        submissionStats,
        recentActivity: generateRecentActivity(users, submissions)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data for development
      setStats({
        totalStudents: 156,
        totalTeachers: 8,
        totalQuestions: 342,
        pendingApprovals: 12,
        activeExams: 4,
        moduleStats: { listening: 85, speaking: 78, reading: 92, writing: 87 },
        submissionStats: { submitted: 234, evaluated: 189, pending: 45 },
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'New student registered: John Doe',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'submission',
            description: 'Listening test submitted by Sarah Wilson',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'exam_created',
            description: 'New diagnostic exam created',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivity = (users: any[], submissions: any[]) => {
    const activities = [];
    
    if (users.length > 0) {
      activities.push({
        id: '1',
        type: 'user_registration',
        description: `New ${users[0].role} registered: ${users[0].name}`,
        timestamp: users[0].createdAt || new Date().toISOString()
      });
    }

    if (submissions.length > 0) {
      activities.push({
        id: '2',
        type: 'submission',
        description: `${submissions[0].module} test submitted`,
        timestamp: submissions[0].createdAt || new Date(Date.now() - 30 * 60 * 1000).toISOString()
      });
    }

    activities.push({
      id: '3',
      type: 'system',
      description: 'System maintenance completed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    });

    return activities.slice(0, 5);
  };

  const moduleData = [
    { name: 'Listening', value: stats.moduleStats.listening },
    { name: 'Speaking', value: stats.moduleStats.speaking },
    { name: 'Reading', value: stats.moduleStats.reading },
    { name: 'Writing', value: stats.moduleStats.writing },
  ];

  const submissionData = [
    { name: 'Submitted', value: stats.submissionStats.submitted },
    { name: 'Evaluated', value: stats.submissionStats.evaluated },
    { name: 'Pending', value: stats.submissionStats.pending },
  ];

  const weeklyActivityData = [
    { day: 'Mon', submissions: 45, registrations: 12 },
    { day: 'Tue', submissions: 52, registrations: 8 },
    { day: 'Wed', submissions: 48, registrations: 15 },
    { day: 'Thu', submissions: 60, registrations: 10 },
    { day: 'Fri', submissions: 55, registrations: 7 },
    { day: 'Sat', submissions: 35, registrations: 5 },
    { day: 'Sun', submissions: 25, registrations: 3 },
  ];

  if (isLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
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
          <div className="sm:text-sm text-[8px] text-gray-500 font-inter">
            Last updated: {new Date().toLocaleDateString()}
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
                <h3 className="font-inter  font-medium text-gray-900">User Management</h3>
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Review Submissions</h3>
                <p className="text-sm text-gray-600">Evaluate student work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
              <span className="text-sm text-green-600 font-inter">+12% this month</span>
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
                <p className="text-sm font-inter text-gray-600">Active Exams</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.activeExams}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-sm text-purple-600 font-inter">Currently running</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Weekly Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="submissions" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Questions by Module</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moduleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-poppins font-bold text-gray-900">Recent Activity</h3>
            <span className="text-sm text-gray-500 font-inter">Last 7 days</span>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user_registration' ? 'bg-green-500' :
                  activity.type === 'submission' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-inter">{activity.description}</p>
                  <p className="text-sm text-gray-500 font-inter">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}