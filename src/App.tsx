import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ListeningModule } from './pages/modules/ListeningModule';
import { SpeakingModule } from './pages/modules/SpeakingModule';
import { ReadingModule } from './pages/modules/ReadingModule';
import { WritingModule } from './pages/modules/WritingModule';
import { AdminPanel } from './pages/AdminPanel';
import { UserManagement } from './pages/UserManagement';
import { QuestionManagement } from './pages/QuestionManagement';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check role if required
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }
  
  return <>{children}</>;
}

function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <TeacherDashboard /> : <Dashboard />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/module/listening" 
        element={
          <ProtectedRoute>
            <ListeningModule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/module/speaking" 
        element={
          <ProtectedRoute>
            <SpeakingModule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/module/reading" 
        element={
          <ProtectedRoute>
            <ReadingModule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/module/writing" 
        element={
          <ProtectedRoute>
            <WritingModule />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/questions" 
        element={
          <AdminRoute>
            <QuestionManagement />
          </AdminRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;