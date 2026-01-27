import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  Headphones,
  Mic,
  PenTool,
  ArrowLeft,
  Share,
  FileText,
  Calendar,
  User
} from "lucide-react";
import { Layout } from "../components/Layout";
import { httpClient } from "../api/httpClient";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export function MyResult() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  const { level } = useParams();
  const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToModule = location.state?.scrollToModule;

  useEffect(() => {
    fetchResults();
  }, [level]);

  useEffect(() => {
    if (scrollToModule && results.length > 0) {
      const moduleId = results.find(r => r.module.toLowerCase() === scrollToModule)?._id;
      if (moduleId) {
        setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
        setTimeout(() => {
          const element = document.getElementById(`module-${moduleId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [results, scrollToModule]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get(`submissions/me/${formattedLevel}`);
      if (response && response.data) {
        setResults(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAnswers = (taskId) => {
    setShowAnswers(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getModuleIcon = (name) => {
    switch (name.toLowerCase()) {
      case "listening": return <Headphones className="w-5 h-5" />;
      case "speaking": return <Mic className="w-5 h-5" />;
      case "reading": return <BookOpen className="w-5 h-5" />;
      case "writing": return <PenTool className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'evaluated': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400';
    }
  };

  // Calculate overall statistics
  const overallStats = results.length > 0 ? {
    totalScore: results.reduce((acc, curr) => acc + curr.totalScore, 0),
    totalPossibleScore: results.reduce((acc, curr) => {
      return acc + curr.responses.reduce((sum, response) => sum + (response.maxScore || 5), 0);
    }, 0),
    percentage: Math.round((results.reduce((acc, curr) => acc + curr.totalScore, 0) / 
      results.reduce((acc, curr) => acc + curr.responses.reduce((sum, response) => sum + (response.maxScore || 5), 0), 0)) * 100),
    evaluatedModules: results.filter(r => r.status === 'evaluated').length,
    totalModules: results.length
  } : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Results</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button 
              onClick={fetchResults}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assessment Results
              </h1>
              <p className="text-gray-900">
                {level} Level • {results.length} modules completed
              </p>
            </div>
          </div>
          

        </div>

        {/* Results Summary */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Overall Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalScore}/{overallStats.totalPossibleScore}
                  </div>
                </div>
              </div>
              <div className="text-center text-lg font-semibold text-primary-600 dark:text-primary-400">
                {overallStats.percentage}%
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Evaluated</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.evaluatedModules}/{overallStats.totalModules}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                Modules Reviewed
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Modules</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalModules}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                All Modules Completed
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(overallStats.totalScore / overallStats.totalModules)}/module
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                Per Module Average
              </div>
            </div>
          </div>
        )}

        {/* Student Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Information</h3>
                <p className="text-gray-600 dark:text-gray-300">{user?.name || "Student"}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-300">Exam Level</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{level}</div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <Award className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You haven't completed any assessment modules yet.
              </p>
              <button
                onClick={() => navigate(`/exam/${level}`)}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-300"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            results.map((submission, index) => (
              <ModuleResultCard
                key={submission._id}
                submission={submission}
                index={index}
                isExpanded={expandedModules[submission._id]}
                showAnswers={showAnswers}
                onToggleModule={() => toggleModule(submission._id)}
                onToggleAnswers={toggleAnswers}
                getModuleIcon={getModuleIcon}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </div>

        {/* Footer Actions */}
        {results.length > 0 && (
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl transition-all duration-300"
            >
              Back to Dashboard
            </button>
            
          </div>
        )}
      </div>
    </Layout>
  );
}

const ModuleResultCard = ({ 
  submission, 
  index, 
  isExpanded, 
  showAnswers, 
  onToggleModule, 
  onToggleAnswers, 
  getModuleIcon, 
  getStatusColor 
}) => {
  const module = submission.module;
  const exam = submission.examId;
  const totalPossibleScore = submission.responses.reduce((acc, response) => 
    acc + (response.maxScore || 5), 0
  );
  const percentage = totalPossibleScore > 0 
    ? Math.round((submission.totalScore / totalPossibleScore) * 100) 
    : 0;

  return (
    <div 
      id={`module-${submission._id}`}
      className={`bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${
        isExpanded ? 'border-primary-200 dark:border-primary-800/30 shadow-lg' : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggleModule}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
              {getModuleIcon(module)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {module} Module
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {exam?.title || 'Assessment'}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  ID: {submission._id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Score Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {submission.totalScore} / {totalPossibleScore} pts
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {percentage}% • {submission.responses.length} questions
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(submission.status)}`}>
              {submission.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
            </div>
            
            {/* Expand Icon */}
            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Performance</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${
                percentage >= 70 
                  ? 'bg-green-500'
                  : percentage >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="font-semibold text-gray-900 dark:text-white">Submitted On</div>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(submission.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div className="font-semibold text-gray-900 dark:text-white">Total Questions</div>
                </div>
                <div className="text-gray-600 dark:text-gray-300">{submission.responses.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="font-semibold text-gray-900 dark:text-white">Submission ID</div>
                </div>
                <div className="text-xs font-mono text-gray-600 dark:text-gray-300">{submission._id}</div>
              </div>
            </div>

            {/* Responses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  Question Details
                </h4>
                <button
                  onClick={() => onToggleAnswers(submission._id)}
                  className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium px-4 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300"
                >
                  {showAnswers[submission._id] ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide Answers</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show Answers</span>
                    </>
                  )}
                </button>
              </div>

              {submission.responses.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No detailed responses available for this module.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submission.responses.map((response, responseIndex) => (
                    <ResponseItem
                      key={responseIndex}
                      response={response}
                      index={responseIndex}
                      showCorrectAnswer={showAnswers[submission._id]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Media URLs (if any) */}
            {submission.mediaUrls && submission.mediaUrls.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Media Submissions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submission.mediaUrls.map((url, index) => {
                    const isVideo = url.includes('.webm') || url.includes('.mp4') || url.includes('.mov');
                    const isImage = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png');
                    
                    return (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {isVideo ? (
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            ) : isImage ? (
                              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {isVideo ? 'Video' : isImage ? 'Image' : 'File'} {index + 1}
                            </span>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary-600 dark:text-primary-400 hover:underline truncate"
                          >
                            {url.split('/').pop()}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ResponseItem = ({ response, index, showCorrectAnswer }) => {
  const isCorrect = response.score > 0 && response.feedback === 'Correct';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">Question {index + 1}</span>
            {response.taskId && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Task ID: {response.taskId.slice(-6)}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Score</div>
          <div className={`text-lg font-bold ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {response.score}/{response.maxScore || 5}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Student's Answer */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer:</label>
          </div>
          <div className="ml-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-900 dark:text-white">
              {response.answer && response.answer !== 'photo_uploaded' 
                ? response.answer 
                : response.answer === 'photo_uploaded'
                  ? 'Photo uploaded (check media submissions)'
                  : 'No answer provided'}
            </p>
          </div>
        </div>

        {/* Feedback */}
        {response.feedback && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback:</label>
            </div>
            <div className={`ml-4 p-3 rounded-lg ${
              isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
            }`}>
              <p className="text-sm">{response.feedback}</p>
              {response.explanation && (
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Explanation:</span> {response.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Correct Answer (if shown) */}
        {showCorrectAnswer && response.task && response.task.correctAnswer && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer:</label>
            </div>
            <div className="ml-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-300 font-medium">{response.task.correctAnswer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResult;