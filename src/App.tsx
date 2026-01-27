// App.tsx - Update the main App component
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import Exam from "./pages/Exam";
import { AdminPanel } from "./pages/AdminPanel";
import { UserManagement } from "./pages/UserManagement";
import { QuestionManagement } from "./pages/QuestionManagement";
import { ExamManagement } from "./pages/ExamManagement";
import { ListeningModule } from "./pages/modules/ListeningModule";
import { ReadingModule } from "./pages/modules/ReadingModule";
import { SpeakingModule } from "./pages/modules/SpeakingModule";
import { WritingModule } from "./pages/modules/WritingModule";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import TeacherSubmissions from "./pages/TeacherSubmission";
import MyResult from "./pages/MyResult";
import StudentDashboard from "./pages/StudentDashboard";
import { ExamProvider, useExam } from "./context/ExamContext";
import { httpClient } from "./api/httpClient";

const queryClient = new QueryClient();

// Spinner Component
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Component to initialize exam data for module routes
const ExamDataInitializer = ({ children }: { children: React.ReactNode }) => {
  const { level } = useParams();
  const { setExamData, setAccessStatus, currentExam, accessStatus } = useExam();
  const location = useLocation();
  const isModuleRoute = location.pathname.includes('/module/');

  useEffect(() => {
    const initializeExamData = async () => {
      if (!level || !isModuleRoute) return;
      
      // Only fetch if we don't have exam data
      if (!currentExam) {
        try {
          const formattedLevel = level.charAt(0).toUpperCase() + level.slice(1);
          const [examResponse, accessResponse] = await Promise.all([
            httpClient.get(`exams/${formattedLevel}/start`),
            httpClient.get("payment/check-access")
          ]);
          
          if (examResponse.data) {
            setExamData(examResponse.data);
          }
          
          if (accessResponse.data) {
            setAccessStatus(accessResponse.data);
          }
        } catch (error) {
          console.error("Failed to initialize exam data:", error);
        }
      }
    };

    initializeExamData();
  }, [level, isModuleRoute, currentExam, setExamData, setAccessStatus]);

  return <>{children}</>;
};

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { loading: examLoading } = useExam();
  const location = useLocation();
  const isModuleRoute = location.pathname.includes('/module/');

  if (isLoading || (isModuleRoute && examLoading)) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Teacher Route Component
function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "teacher" && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Student Route Component
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { loading: examLoading } = useExam();
  const location = useLocation();
  const isModuleRoute = location.pathname.includes('/module/');

  if (isLoading || (isModuleRoute && examLoading)) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "student") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// App Router Component
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
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin"
                  : user.role === "teacher"
                  ? "/teacher"
                  : "/dashboard"
              }
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === "teacher" || user?.role === "admin" ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/teacher"}
                replace
              />
            ) : (
              <StudentDashboard />
            )}
          </ProtectedRoute>
        }
      />

      {/* Exam Routes with Data Initialization */}
      <Route
        path="/exam/:level"
        element={
          <StudentRoute>
            <Exam />
          </StudentRoute>
        }
      />

      <Route
        path="/exam/:level/module/listening"
        element={
          <StudentRoute>
            <ExamDataInitializer>
              <ListeningModule />
            </ExamDataInitializer>
          </StudentRoute>
        }
      />

      <Route
        path="/exam/:level/module/reading"
        element={
          <StudentRoute>
            <ExamDataInitializer>
              <ReadingModule />
            </ExamDataInitializer>
          </StudentRoute>
        }
      />

      <Route
        path="/exam/:level/module/speaking"
        element={
          <StudentRoute>
            <ExamDataInitializer>
              <SpeakingModule />
            </ExamDataInitializer>
          </StudentRoute>
        }
      />

      <Route
        path="/exam/:level/module/writing"
        element={
          <StudentRoute>
            <ExamDataInitializer>
              <WritingModule />
            </ExamDataInitializer>
          </StudentRoute>
        }
      />

      <Route
        path="/results/:level"
        element={
          <ProtectedRoute>
            <MyResult />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
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

      <Route
        path="/admin/exams"
        element={
          <AdminRoute>
            <ExamManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/submission"
        element={
          <AdminRoute>
            <TeacherSubmissions />
          </AdminRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <TeacherRoute>
            <TeacherDashboard />
          </TeacherRoute>
        }
      />

      <Route
        path="/teacher/submissions"
        element={
          <TeacherRoute>
            <TeacherSubmissions />
          </TeacherRoute>
        }
      />

      <Route
        path="/teacher/tasks"
        element={
          <TeacherRoute>
            <QuestionManagement />
          </TeacherRoute>
        }
      />

      <Route
        path="/teacher/exams"
        element={
          <TeacherRoute>
            <ExamManagement />
          </TeacherRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ExamProvider>
          <Router>
            <AppRouter />
          </Router>
        </ExamProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}