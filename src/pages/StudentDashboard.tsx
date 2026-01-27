import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Headphones, 
  Mic, 
  PenTool, 
  Lock, 
  CheckCircle,
  Unlock,
  Play,
  AlertCircle,
  ChevronRight,
  Zap,
  Clock,
  Trophy,
  User
} from 'lucide-react';

import { useAuth } from "../context/AuthContext";
import { apiClient } from '../services/api';
import { httpClient } from '../api/httpClient';
import { PaymentModal } from '../components/PaymentModal';
import { Layout } from '../components/Layout';
import { Exam } from '../types';
import { ProfileInfoModal } from '../components/ProfileInfoModal';

const moduleIcons = {
  listening: Headphones,
  speaking: Mic,
  reading: BookOpen,
  writing: PenTool,
};

interface ExamWithAccess {
  exam: {
    _id: string;
    title: string;
    level: string;
  };
  hasAccess: boolean;
  hasUnlocked: boolean;
  isCompleted: boolean;
  needsPayment: boolean;
}

interface PaymentStatus {
  success: boolean;
  canUnlockMore: boolean;
  maxConcurrentExams: number;
  currentExamCount: number;
  exams: ExamWithAccess[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAccessData, setExamAccessData] = useState<PaymentStatus | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    examId: string;
    examTitle: string;
    amount: number;
  }>({
    isOpen: false,
    examId: '',
    examTitle: '',
    amount: 1000,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsData, statusData, userDetailData] = await Promise.all([
        apiClient.getExams(),
        httpClient.get('payment/check-access'),
        httpClient.get('users/detail').catch(() => null)
      ]);
      
      setExams(examsData);
      setExamAccessData(statusData);
      setUserDetail(userDetailData?.data || null);

      if (!userDetailData?.data) {
        setTimeout(() => {
          setShowProfileModal(true);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam: Exam) => {
    const examAccess = examAccessData?.exams.find(
      e => e.exam._id === exam._id
    );
    
    if (examAccess?.hasAccess) {
      navigate(`/exam/${exam.level}`);
    } else {
      setPaymentModal({
        isOpen: true,
        examId: exam._id,
        examTitle: `${exam.level} - ${exam.title}`,
        amount: 10000
      });
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModal({ ...paymentModal, isOpen: false });
    fetchData();
  };

  const handleContinueExam = (exam: Exam) => {
    navigate(`/exam/${exam.level.toLowerCase()}`);
  };

  const getExamAccessStatus = (examId: string) => {
    if (!examAccessData) return null;
    return examAccessData.exams.find(e => e.exam._id === examId);
  };

  const handleProfileUpdate = () => {
    fetchData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Continue your language assessment journey
              </p>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Profile</span>
            </button>
          </div>

          {/* Stats Grid */}
          {examAccessData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Active Exams</p>
                    <p className="text-3xl font-bold text-blue-900">{examAccessData.currentExamCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  {examAccessData.canUnlockMore 
                    ? `${examAccessData.maxConcurrentExams - examAccessData.currentExamCount} more available`
                    : 'Max limit reached'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-900">
                      {examAccessData.exams.filter(e => e.isCompleted).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-2">Exams finished</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Available</p>
                    <p className="text-3xl font-bold text-purple-900">{exams.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-purple-600 mt-2">Total exams available</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Assessments</h2>
            {examAccessData && !examAccessData.canUnlockMore && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Max {examAccessData.maxConcurrentExams} active exams allowed
                </span>
              </div>
            )}
          </div>

          {/* Exams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams?.map((exam) => {
              const accessStatus = getExamAccessStatus(exam._id);
              const isBasic = exam.level.toLowerCase() === 'basic';
              
              const hasAccess = accessStatus?.hasAccess || false;
              const isCompleted = accessStatus?.isCompleted || false;
              const hasUnlocked = accessStatus?.hasUnlocked || false;
              
              const levelColor = isBasic ? 'blue' : 'purple';
              const levelBgColor = isBasic ? 'bg-blue-50' : 'bg-purple-50';
              const levelBorderColor = isBasic ? 'border-blue-200' : 'border-purple-200';
              const levelTextColor = isBasic ? 'text-blue-700' : 'text-purple-700';

              return (
                <div
                  key={exam._id}
                  className={`relative bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 ${levelBorderColor} ${isCompleted ? 'opacity-90' : ''}`}
                >
                  {/* Status Badge */}
                  {/* <div className="absolute top-4 right-4 z-10">
                    {isCompleted ? (
                      <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    ) : hasAccess ? (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" />
                        In Progress
                      </div>
                    ) : hasUnlocked ? (
                      <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </div>
                    ) : null}
                  </div> */}

                  <div className={`p-6 ${levelBgColor} rounded-t-2xl`}>
                    <div className="flex items-start justify-between">
                      <div className="pr-8">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${levelTextColor} bg-white`}>
                          {exam.level}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                        <p className="text-sm text-gray-600">
                          {exam.description || 'Complete all 4 modules to finish the exam'}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        hasAccess 
                          ? 'bg-blue-100 text-blue-600' 
                          : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : hasAccess ? (
                          <Play className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-medium text-gray-700 mb-4">Modules included:</p>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {["listening", "reading", "speaking", "writing"].map((module) => {
                        const Icon = moduleIcons[module];
                        const colorMap = {
                          listening: 'bg-red-100 text-red-600',
                          reading: 'bg-blue-100 text-blue-600',
                          speaking: 'bg-green-100 text-green-600',
                          writing: 'bg-amber-100 text-amber-600'
                        };
                        
                        return (
                          <div
                            key={module}
                            className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorMap[module]}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 capitalize">{module}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Button */}
                    {hasAccess && !isCompleted ? (
                      <button
                        onClick={() => handleContinueExam(exam)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Continue Exam
                        <ChevronRight className="w-5 h-5 ml-auto" />
                      </button>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleContinueExam(exam)}
                        className="w-full bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        View Results
                        <ChevronRight className="w-5 h-5 ml-auto" />
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleExamClick(exam)}
                          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg"
                        >
                          {hasUnlocked ? (
                            <>
                              <Unlock className="w-5 h-5 mr-2" />
                              Unlock Access
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              Unlock for ₹100
                            </>
                          )}
                          <ChevronRight className="w-5 h-5 ml-auto" />
                        </button>
                        
                        {hasUnlocked && (
                          <button
                            onClick={() => navigate(`/exam/preview/${exam._id}`)}
                            className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Preview Exam Content
                          </button>
                        )}
                      </div>
                    )}

                    {/* Access Info */}
                    {hasUnlocked && !hasAccess && !isCompleted && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-700">
                            {examAccessData?.canUnlockMore 
                              ? 'You have purchased this exam. Unlock it to start.'
                              : `Complete one of your ${examAccessData?.currentExamCount} active exams to unlock this.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {exams.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No exams available</h3>
                <p className="text-gray-500">Check back soon for new assessments!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileInfoModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={handleProfileUpdate}
        userDetail={userDetail}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
        onSuccess={handlePaymentSuccess}
        amount={paymentModal.amount}
        examId={paymentModal.examId}
        examTitle={paymentModal.examTitle}
      />
    </Layout>
  );
}