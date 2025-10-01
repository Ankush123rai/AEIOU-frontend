import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Settings, Users, FileText } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  console.log("user.avatar", user.avatar);

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="text-2xl font-poppins font-bold text-primary-900 hover:text-primary-800 transition-colors"
              >
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
              </Link>
              {title && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-lg font-inter font-medium text-gray-700">
                    {title}
                  </span>
                </>
              )}
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                {(isAdmin || isTeacher) && (
                  <nav className="flex items-center space-x-2">
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-inter font-medium transition-colors ${
                            location.pathname === "/admin"
                              ? "bg-primary-100 text-primary-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-inter font-medium transition-colors ${
                            location.pathname === "/admin/users"
                              ? "bg-primary-100 text-primary-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>Users</span>
                        </Link>
                        <Link
                          to="/admin/questions"
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-inter font-medium transition-colors ${
                            location.pathname === "/admin/questions"
                              ? "bg-primary-100 text-primary-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>Questions</span>
                        </Link>
                      </>
                    )}
                  </nav>
                )}
                <div className="flex items-center space-x-2">
                  <img
                    src={user.avatar ? user.avatar : "https://cdn-icons-png.flaticon.com/128/4140/4140037.png"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm font-inter font-medium text-gray-700">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
