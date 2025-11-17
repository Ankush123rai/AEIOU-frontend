import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Play, CheckCircle, Lock, EyeOff, Eye, Mail, ArrowLeft, Shield, User2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { User } from "../types";

type FormMode = 'login' | 'register' | 'verify';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, register, emailVerify, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    general: ""
  });

  useEffect(() => {
    if (isLoading) return;
  
    if (user) {
      if (user.role === 'student') {
        navigate('/dashboard', { replace: true });
      } else if (['admin', 'teacher'].includes(user.role)) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, isLoading]);
  
  
  

  const getPendingEmail = () => {
    return localStorage.getItem('pendingVerificationEmail') || formData.email;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      otp: "",
      general: ""
    };

    if (formMode === 'register' && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formMode !== 'verify' && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formMode !== 'verify' && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formMode === 'verify' && !formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (formMode === 'verify' && formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.otp;
  };

  const handleNavigation = (userData: User) => {
    if (userData.role === 'admin' || userData.role === 'teacher') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
  
    try {
      if (formMode === 'login') {
        const u = await login(formData.email, formData.password);
        handleNavigation(u);
      } else if (formMode === 'register') {
        await register(formData.name, formData.email, formData.password);
        localStorage.setItem('pendingVerificationEmail', formData.email);
        setFormMode('verify');
      } else if (formMode === 'verify') {
        const res = await emailVerify(getPendingEmail(), parseInt(formData.otp, 10));
        
        if (res.user) {
          setVerificationStatus('success');
          setTimeout(() => {
            handleNavigation(res.user);
          }, 1500);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrors(prev => ({
        ...prev,
        general: err.response?.data?.error || err.message || 'Authentication failed',
      }));
    } finally {
      setIsLoading(false);
    }
  };
  

  

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Google login failed:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Google login failed. Please try again.",
      }));
    }
  };

  const switchToRegister = () => {
    setFormMode('register');
    setFormData({ name: "", email: "", password: "", otp: "" });
    setErrors({ name: "", email: "", password: "", otp: "", general: "" });
    localStorage.removeItem('pendingVerificationEmail');
  };

  const switchToLogin = () => {
    setFormMode('login');
    setFormData({ name: "", email: "", password: "", otp: "" });
    setErrors({ name: "", email: "", password: "", otp: "", general: "" });
    localStorage.removeItem('pendingVerificationEmail');
  };

  const goBack = () => {
    if (formMode === 'verify') {
      setFormMode('register');
    } else {
      setFormMode('login');
    }
  };

  const verificationEmail = formMode === 'verify' ? getPendingEmail() : formData.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="sm:text-3xl text-xl items-center flex gap-1 font-poppins font-bold select-none">
                <span className="text-orange-500">AE</span>
                <span className="text-blue-600">I</span>
                <img
                  className="sm:w-7 sm:h-7 w-4 h-4"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Ashoka_Chakra.svg/2048px-Ashoka_Chakra.svg.png"
                  alt="india"
                />
                <span className="text-green-500">U</span>
              </div>
              <span className="text-xs font-medium">Assessment Of English In Our Union</span>
              </div>
              
            </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-white mb-4 drop-shadow-lg">
              Assessment Of English In Our Union
            </h1>
            <p className="text-xl text-blue-100 font-inter max-w-2xl mx-auto leading-relaxed">
            Assess your English skills through comprehensive assessment across listening, speaking, reading, and writing modules.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
              <div className="flex items-center mb-8">
                {formMode !== 'login' && (
                  <button
                    onClick={goBack}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors mr-3"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-poppins font-bold text-white">
                    {formMode === 'login' && 'Welcome Back'}
                    {formMode === 'register' && 'Create Account'}
                    {formMode === 'verify' && 'Verify Email'}
                  </h2>
                  <p className="text-blue-100 font-inter mt-1">
                    {formMode === 'login' && 'Sign in to continue your assessment'}
                    {formMode === 'register' && 'Start your English assessment journey'}
                    {formMode === 'verify' && 'Enter the OTP sent to your email'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2 font-inter">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User2 className="h-5 w-5 text-blue-300" />
                      </div>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white placeholder-blue-200 ${
                          errors.name ? "border-red-400" : "border-white/20"
                        }`}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-red-300 text-sm font-inter">
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {(formMode === 'login' || formMode === 'register') && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2 font-inter">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-blue-300" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white placeholder-blue-200 ${
                          errors.email ? "border-red-400" : "border-white/20"
                        }`}
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-red-300 text-sm font-inter">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

{formMode === 'verify' && (
  <div>
    <label className="block text-sm font-medium text-blue-100 mb-2 font-inter">
      Verification Code
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Shield className="h-5 w-5 text-blue-300" />
      </div>
      <input
        name="otp"
        type="text"
        value={formData.otp}
        onChange={handleInputChange}
        className={`block w-full pl-10 pr-3 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white placeholder-blue-200 ${
          errors.otp ? "border-red-400" : verificationStatus === 'success' ? 'border-green-400' : "border-white/20"
        }`}
        placeholder="Enter 6-digit OTP"
        disabled={isLoading || verificationStatus === 'success'}
        maxLength={6}
        pattern="[0-9]*"
        inputMode="numeric"
      />
      {verificationStatus === 'success' && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
      )}
    </div>
    {errors.otp && (
      <p className="mt-2 text-red-300 text-sm font-inter">{errors.otp}</p>
    )}
    <p className="mt-2 text-blue-200 text-sm font-inter">
      We sent a verification code to {verificationEmail}
    </p>
    {verificationStatus === 'success' && (
      <p className="mt-2 text-green-300 text-sm font-inter">
        ✓ Email verified successfully! Redirecting...
      </p>
    )}
  </div>
)}

                {(formMode === 'login' || formMode === 'register') && (
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-2 font-inter">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-300" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-10 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-inter text-white placeholder-blue-200 ${
                          errors.password ? "border-red-400" : "border-white/20"
                        }`}
                        placeholder="Enter your password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/5 rounded-r-2xl transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-blue-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-blue-300" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-red-300 text-sm font-inter">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}

                {errors.general && (
                  <div className="bg-red-400/20 border border-red-400/30 rounded-2xl p-4">
                    <p className="text-red-200 text-sm font-inter">{errors.general}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-4 rounded-2xl font-inter font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {formMode === 'login' && 'Signing in...'}
                      {formMode === 'register' && 'Creating account...'}
                      {formMode === 'verify' && 'Verifying...'}
                    </div>
                  ) : (
                    <>
                      {formMode === 'login' && 'Sign In'}
                      {formMode === 'register' && 'Create Account'}
                      {formMode === 'verify'&&'Verify Email'}
                    </>
                  )}
                </button>
              </form>

              {formMode === 'login' && (
                <div className="mt-6 text-center">
                  <p className="text-blue-200 font-inter">
                    Don't have an account?{" "}
                    <button
                      onClick={switchToRegister}
                      className="text-white font-semibold hover:text-blue-200 transition-colors underline"
                      type="button"
                    >
                      Create new account
                    </button>
                  </p>
                </div>
              )}

              {formMode === 'register' && (
                <div className="mt-6 text-center">
                  <p className="text-blue-200 font-inter">
                    Already have an account?{" "}
                    <button
                      onClick={switchToLogin}
                      className="text-white font-semibold hover:text-blue-200 transition-colors underline"
                      type="button"
                    >
                      Sign in instead
                    </button>
                  </p>
                </div>
              )}

              {formMode === 'login' && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-transparent text-blue-200 font-inter">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleGoogleLogin}
                      id="google-signin-button"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-2xl font-inter font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-white">
                <h3 className="text-2xl font-poppins font-bold mb-6 drop-shadow-lg">
                  Comprehensive English Assessment
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Play className="w-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-inter font-semibold mb-1">Four Core Modules</h4>
                      <p className="font-inter text-blue-100 text-sm">
                        Complete assessment across Listening, Speaking, Reading, and Writing skills
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <CheckCircle className="w-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-inter font-semibold mb-1">Time Management</h4>
                      <p className="font-inter text-blue-100 text-sm">
                        Each module has optimized time limits to test your efficiency
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Lock className="w-5 w-5 text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-inter font-semibold mb-1">Auto-Save Progress</h4>
                      <p className="font-inter text-blue-100 text-sm">
                        Your progress is automatically saved across all devices
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Eye className="w-5 w-5 text-orange-300" />
                    </div>
                    <div>
                      <h4 className="font-inter font-semibold mb-1">Detailed Analytics</h4>
                      <p className="font-inter text-blue-100 text-sm">
                        Get comprehensive insights and personalized feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}