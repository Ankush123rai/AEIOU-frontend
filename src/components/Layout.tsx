import React, { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { path: "/admin/submission", icon: List, label: "Submissions" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
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

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
        <Link
          to={user?.role === "admin" ? "/admin" : "/teacher"}
          className="text-2xl flex items-center gap-2 font-poppins font-bold hover:opacity-80 transition-opacity"
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
              onClick={() => setSidebarOpen(false)}
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

      {/* Logout */}
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role !== "student" && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 z-40">
            {SidebarContent}
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          <div
            className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 z-50 md:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            {SidebarContent}
          </div>
        </>
      )}

      {/* Main Content */}
      {user?.role !== "student" ? (
        <div className="md:pl-64">
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-8 h-16">
              <div className="flex items-center space-x-3">
                {/* Mobile Toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>

                <span className="text-sm sm:text-lg font-semibold text-gray-600">
                  Welcome back, {user?.name}!
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl font-medium transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <main className="p-4 sm:p-8">{children}</main>
        </div>
      ) : (
        // Student layout remains same
        <>
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="sm:px-8 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
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
                          <span className="text-xs font-medium">
                            Assessment Of English In Our Union
                          </span>
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

          <main className="sm:p-8 p-2">{children}</main>
        </>
      )}
    </div>
  );
}
