import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  FileText,
  BookOpen,
  BarChart3,
  LogOut,
  Settings,
  ClipboardList,
  UserCheck,
  List,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const adminNavItems = [
    { path: "/admin", icon: BarChart3, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/questions", icon: FileText, label: "Question Bank" },
    { path: "/admin/exams", icon: BookOpen, label: "Exam Management" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
    { path: "/admin/submission", icon: List, label: "Submissions" },
    
  ];

  const teacherNavItems = [
    { path: "/teacher", icon: BarChart3, label: "Dashboard" },
    { path: "/teacher/questions", icon: FileText, label: "My Questions" },
    { path: "/teacher/exams", icon: BookOpen, label: "My Exams" },
    { path: "/teacher/results", icon: ClipboardList, label: "Results" },
    { path: "/teacher/profile", icon: UserCheck, label: "Profile" },
  ];

  const navItems = user?.role === "admin" ? adminNavItems : teacherNavItems;

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role !== "student" && (
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 z-50">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
              <Link
                to={user?.role === "admin" ? "/admin" : "/teacher"}
                className="text-2xl items-center flex gap-2 font-poppins font-bold hover:opacity-80 transition-opacity"
              >
                <span className="text-orange-500">AE</span>
                <span className="text-blue-600">I</span>
                <img
                  className="w-5 h-5"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                  alt="india"
                />
                <span className="text-green-600">U</span>
              </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl font-inter transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl font-inter font-medium transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {user?.role !== "student" ? (
        <div className="pl-64">
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-500">
                    Welcome back, {user?.name}!
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="p-4 bg-white">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl font-inter font-medium transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-8">{children}</main>
        </div>
      ) : (
        <>
           <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <div className="flex justify-center">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                <span className="text-orange-500">AE</span>
                <span className="text-blue-600">I</span>
                <img
                  className="sm:w-7 sm:h-7 w-4 h-4"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/1200px-Ashoka_Chakra.svg.png"
                  alt="india"
                />
                <span className="text-green-500">U</span>
              </div>
              <span className="text-xs font-medium">Assessment Of English In Our Union</span>
              </div>
              
            </div>
              </div>
            </div>
                </div>
                <div className="p-4 bg-white">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl font-inter font-medium transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header> 

          <main className="p-8">{children}</main>
        </>
        
      )}
    </div>
  );
}
