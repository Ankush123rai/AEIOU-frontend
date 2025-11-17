import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Headphones,
  Mic,
  PenTool,
  BookOpen,
  CheckCircle,
  Play,
  Award,
  TrendingUp,
  HelpCircle,
  Clock as ClockIcon,
  AlertCircle,
  User,
  Lock,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExam } from "../hooks/useExam";
import { useModuleSubmission } from "../hooks/useModuleSubmission";
import { useUserDetails } from "../hooks/useUserDetails";
import { usePaymentStatus } from "../hooks/usePaymentStatus"; // Add this import
import { Layout } from "../components/Layout";
import { ProfileInfoModal } from "../components/ProfileInfoModal";
import { PaymentModal } from "../components/PaymentModal";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { currentExam, loading: examsLoading, err: examsErr } = useExam();
  const examId = currentExam?._id || "";
  const moduleDefs = useMemo(() => currentExam?.modules || [], [currentExam]);
  
  const { 
    loading: subsLoading, 
    isSubmitted, 
    getModuleStatus, 
    getModuleDetails 
  } = useModuleSubmission(examId, moduleDefs);

  const {
    userDetails,
    loading: detailsLoading,
    error: detailsError,
    createUserDetails,
    isProfileComplete,
  } = useUserDetails();

  // Add payment status hook
  const { 
    paymentStatus, 
    loading: paymentLoading, 
    error: paymentError,
    refetch: refetchPaymentStatus 
  } = usePaymentStatus();

  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState(null);

  const busy = examsLoading || subsLoading || detailsLoading || paymentLoading;

  const totalModules = moduleDefs.length;
  const completedModules = moduleDefs.filter((module) =>
    isSubmitted(module.name)
  ).length;

  const overallProgress = totalModules
    ? Math.round((completedModules / totalModules) * 100)
    : 0;

  // Check if assessment is unlocked - use paymentStatus from API
  const isAssessmentUnlocked = paymentStatus?.isAssessmentUnlocked || false;
  const hasPaymentDetails = !!paymentStatus?.paymentDetails;

  useEffect(() => {
    if (!detailsLoading && !isProfileComplete && user) {
      setShowForm(true);
    }
  }, [detailsLoading, isProfileComplete, user]);

  const handleFormSubmit = async (formData) => {
    try {
      await createUserDetails(formData);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save profile details:", error);
    }
  };

  const handleCloseForm = () => {
    if (isProfileComplete) setShowForm(false);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setPaymentStatusMessage('success');
    // Refresh payment status
    await refetchPaymentStatus();
  };

  const getModuleTaskCount = (module) => {
    return module.taskIds?.length || 0;
  };

  const getModuleQuestionCount = (module) => {
    if (!module.taskIds) return 0;
    
    let totalQuestions = 0;
    
    if (module.name === 'listening' || module.name === 'reading') {
      module.taskIds.forEach(task => {
        if (task.questions && task.questions.length > 0) {
          totalQuestions += task.questions.length;
        } else {
          totalQuestions += 1;
        }
      });
    } else {
      totalQuestions = module.taskIds.length;
    }
    
    return totalQuestions;
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Payment Success Message */}
        {paymentStatusMessage === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">
                  Payment Successful!
                </h3>
                <p className="text-green-700 text-sm">
                  Your assessment has been unlocked. You can now start your modules.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Completed Message */}
        {isAssessmentUnlocked && hasPaymentDetails && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">
                  Assessment Unlocked ✅
                </h3>
                <p className="text-green-700 text-sm">
                  You have full access to all assessment modules. Payment completed on {new Date(paymentStatus.paymentDetails.paymentDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Locked Message - Only show if profile is complete but payment is not done */}
        {!isAssessmentUnlocked && isProfileComplete && !paymentLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-blue-800 font-semibold">
                    Assessment Locked
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Unlock all 4 assessment modules by completing the payment of ₹100.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Unlock Assessment</span>
              </button>
            </div>
          </div>
        )}

        {!isProfileComplete && !detailsLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="text-yellow-800 font-semibold">
                  Profile Incomplete
                </h3>
                <p className="text-yellow-700 text-sm">
                  Please complete your profile details to start the test.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          {completedModules === totalModules && totalModules > 0 && (
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-1">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || "Learner"}!
          </h2>
          <p className="text-gray-600 font-inter max-w-md mx-auto">
            {busy
              ? "Loading your assessment..."
              : !isProfileComplete
              ? "Complete your profile to start the assessment"
              : !isAssessmentUnlocked
              ? "Unlock assessment to start your modules"
              : completedModules === totalModules
              ? "Congratulations! You've completed all modules 🎉"
              : currentExam
              ? `Continue your "${currentExam.title}" assessment`
              : "No active assessment found"}
          </p>
          {examsErr && <p className="text-red-600 text-sm mt-2">{examsErr}</p>}
          {detailsError && (
            <p className="text-red-600 text-sm mt-2">{detailsError}</p>
          )}
          {paymentError && (
            <p className="text-red-600 text-sm mt-2">Payment status error: {paymentError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Profile Status"
            icon={
              <User
                className={`w-5 h-5 ${
                  isProfileComplete ? "text-green-500" : "text-yellow-500"
                }`}
              />
            }
          >
            <div className="text-center mb-4 flex justify-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isProfileComplete
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {isProfileComplete ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 font-inter text-center">
              {isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
            </p>
            {isProfileComplete && userDetails && (
              <p className="text-xs text-gray-500 text-center mt-1">
                {userDetails.fullname}
              </p>
            )}
          </Card>

          <Card
            title="Assessment Access"
            icon={
              isAssessmentUnlocked ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )
            }
          >
            <div className="text-center mb-4 flex justify-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isAssessmentUnlocked
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isAssessmentUnlocked ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <Lock className="w-8 h-8" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 font-inter text-center">
              {isAssessmentUnlocked ? "Assessment Unlocked" : "Assessment Locked"}
            </p>
            {isAssessmentUnlocked && paymentStatus?.paymentDetails && (
              <p className="text-xs text-green-600 text-center mt-1">
                Paid on {new Date(paymentStatus.paymentDetails.paymentDate).toLocaleDateString()}
              </p>
            )}
            {!isAssessmentUnlocked && isProfileComplete && !paymentLoading && (
              <button
                onClick={() => setShowPayment(true)}
                className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium text-sm"
              >
                Unlock for ₹100
              </button>
            )}
          </Card>

          <Card
            title="Overall Progress"
            icon={<TrendingUp className="w-5 h-5 text-primary-500" />}
          >
            <div className="text-center mb-4 flex justify-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                <span className="text-2xl font-poppins font-bold text-primary-900">
                  {busy ? "—" : `${overallProgress}%`}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-inter text-center">
              {busy
                ? "Loading..."
                : `${completedModules} of ${totalModules} modules completed`}
            </p>
          </Card>
        </div>

        {/* Rest of your component remains the same */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-poppins font-bold text-gray-900">
              Assessment Modules
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Legend color="bg-green-500" label="Evaluated" />
              <Legend color="bg-blue-500" label="Submitted" />
              <Legend color="bg-primary-500" label="Available" />
              {(!isProfileComplete || !isAssessmentUnlocked) && (
                <Legend color="bg-gray-400" label="Locked" />
              )}
            </div>
          </div>

          {busy && (
            <div className="text-center text-gray-500 py-6">
              Loading modules…
            </div>
          )}

          {!busy && moduleDefs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {moduleDefs.map((module, index) => {
                const submitted = isSubmitted(module.name);
                const moduleStatus = getModuleStatus(module.name);
                const moduleDetails = getModuleDetails(module.name);
                const totalTasks = getModuleTaskCount(module);
                const totalQuestions = getModuleQuestionCount(module);

                const isModuleAccessible = isProfileComplete && isAssessmentUnlocked;

                return (
                  <ModuleCard
                    key={module.name}
                    module={{
                      id: module.name,
                      name: module.name,
                      icon: getModuleIcon(module.name),
                      progress: submitted ? 100 : 0,
                      completed: submitted,
                      status: moduleStatus,
                      score: moduleDetails?.score,
                      description: `${totalTasks} Tasks`,
                      duration: `${module.durationMinutes || "--"} mins`,
                      questions: totalQuestions,
                      color: getColor(module.name),
                    }}
                    index={index}
                    onStart={() =>
                      isModuleAccessible &&
                      !submitted &&
                      navigate(`/module/${module.name}`)
                    }
                    disabled={!isModuleAccessible}
                    isLocked={!isAssessmentUnlocked}
                  />
                );
              })}
            </div>
          )}

          {!busy && moduleDefs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
                No Assessment Available
              </h4>
              <p className="text-gray-600 font-inter">
                There are no active assessments at the moment.
              </p>
            </div>
          )}
        </section>

        {/* Help Button */}
        <div className="flex justify-center pt-8">
          <button
            className="flex items-center space-x-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-inter font-medium hover:shadow-md transition-all"
            onClick={() => navigate("/faq")}
          >
            <HelpCircle className="w-5 h-5" />
            <span>Need Help? View FAQ & Support</span>
          </button>
        </div>
      </div>

      <ProfileInfoModal
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        forceOpen={!isProfileComplete && !detailsLoading}
      />

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        amount={10000}
      />
    </Layout>
  );
}


// Update ModuleCard component to show lock state
const ModuleCard = ({ module, index, onStart, disabled = false, isLocked = false }) => {
  const isCompleted = module.completed;
  
  const getButtonText = () => {
    if (isCompleted) {
      if (module.status === 'evaluated') {
        return (
          <div className="flex items-center justify-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Completed {module.score !== undefined ? `(${module.score} pts)` : ''}</span>
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Submitted</span>
        </div>
      );
    }
    
    if (isLocked) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>Locked</span>
        </div>
      );
    }
    
    if (disabled) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>Complete Profile</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center space-x-2">
        <Play className="w-4 h-4" />
        <span>Start</span>
      </div>
    );
  };

  const getCardStyle = () => {
    if (isCompleted) {
      if (module.status === 'evaluated') {
        return "border-green-200 bg-green-50";
      }
      return "border-blue-200 bg-blue-50";
    }
    if (isLocked || disabled) return "border-gray-200 bg-gray-50 opacity-60";
    return "border-blue-200 bg-white hover:border-blue-300 cursor-pointer hover:shadow-md";
  };

  const getButtonStyle = () => {
    if (isCompleted) {
      if (module.status === 'evaluated') {
        return "bg-green-500 text-white cursor-not-allowed";
      }
      return "bg-blue-500 text-white cursor-not-allowed";
    }
    if (isLocked || disabled) return "bg-gray-400 text-gray-200 cursor-not-allowed";
    return "bg-primary-500 hover:bg-primary-600 text-white";
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 animate-slide-up ${getCardStyle()}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${
            isCompleted
              ? module.status === 'evaluated' 
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
              : isLocked || disabled
              ? "bg-gray-100 text-gray-400"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isCompleted ? (
            module.status === 'evaluated' ? (
              <Award className="w-6 h-6 text-green-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-blue-600" />
            )
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : (
            module.icon
          )}
        </div>
        {isCompleted && module.status === 'evaluated' && module.score !== undefined && (
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Score: {module.score}
          </div>
        )}
        {isLocked && (
          <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
            Locked
          </div>
        )}
      </div>

      <h4 className="text-lg font-poppins font-bold text-gray-900 mb-2 capitalize">
        {module.name}
      </h4>
      <p className="text-gray-600 text-sm font-inter mb-4">
        {module.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-3 h-3" />
          <span>{module.duration}</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen className="w-3 h-3" />
          <span>{module.questions} questions</span>
        </div>
      </div>

      <button
        className={`w-full py-3 px-4 rounded-xl font-inter font-medium transition-all ${getButtonStyle()} transform ${
          !disabled && !isCompleted && !isLocked ? "hover:scale-[1.02]" : ""
        }`}
        onClick={onStart}
        disabled={disabled || isCompleted || isLocked}
      >
        {getButtonText()}
      </button>
      
      {isCompleted && module.status === 'evaluated' && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            Status: Evaluated
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You cannot retake this test
          </p>
        </div>
      )}
      
      {isLocked && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            Unlock assessment to access
          </p>
        </div>
      )}
    </div>
  );
};


const Card = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-poppins font-semibold text-gray-900">
        {title}
      </h3>
      {icon}
    </div>
    {children}
  </div>
);

const Legend = ({ color, label }) => (
  <div className="flex items-center space-x-1">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <span>{label}</span>
  </div>
);


const getModuleIcon = (name) => {
  switch (name.toLowerCase()) {
    case "listening":
      return <Headphones className="w-6 h-6" />;
    case "speaking":
      return <Mic className="w-6 h-6" />;
    case "reading":
      return <BookOpen className="w-6 h-6" />;
    case "writing":
      return <PenTool className="w-6 h-6" />;
    default:
      return <Play className="w-6 h-6" />;
  }
};

const getColor = (name) => {
  switch (name.toLowerCase()) {
    case "listening":
      return "blue";
    case "speaking":
      return "green";
    case "reading":
      return "purple";
    case "writing":
      return "orange";
    default:
      return "gray";
  }
};