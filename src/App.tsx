
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { UserManagement } from './pages/UserManagement';
import { QuestionManagement } from './pages/QuestionManagement';
import { ExamManagement } from './pages/ExamManagement';
import { ListeningModule } from './pages/modules/ListeningModule';
import { ReadingModule } from './pages/modules/ReadingModule';
import { SpeakingModule } from './pages/modules/SpeakingModule';
import { WritingModule } from './pages/modules/WritingModule';
import TeacherSubmissions from './pages/TeacherSubmission';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}


function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin' && user.role !== 'teacher') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isLoading ? (
            <Spinner />
          ) : user ? (
            <Navigate to={user.role === 'admin' || user.role === 'teacher' ? '/admin' : '/dashboard'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/module/listening" element={<ProtectedRoute><ListeningModule /></ProtectedRoute>} />
      <Route path="/module/reading" element={<ProtectedRoute><ReadingModule /></ProtectedRoute>} />
      <Route path="/module/speaking" element={<ProtectedRoute><SpeakingModule /></ProtectedRoute>} />
      <Route path="/module/writing" element={<ProtectedRoute><WritingModule /></ProtectedRoute>} />
      ``
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/questions" element={<AdminRoute><QuestionManagement /></AdminRoute>} />
      <Route path="/admin/exams" element={<AdminRoute><ExamManagement /></AdminRoute>} />
      <Route path="/admin/submission" element={<AdminRoute><TeacherSubmissions /></AdminRoute>} />
      
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}