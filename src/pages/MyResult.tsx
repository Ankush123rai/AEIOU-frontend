// src/pages/MyResult.js
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
  TrendingUp
} from "lucide-react";
import { Layout } from "../components/Layout";
import { apiClient } from "../services/api";

export function MyResult() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await apiClient.fetchMySubmissions();
      if (response.success) {
        setResults(response.data);
        console.log("Fetched results:", response.data);

      }
    } catch (err) {
      setError(err.message);
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
      case "listening": return <BookOpen className="w-5 h-5" />;
      case "speaking": return <TrendingUp className="w-5 h-5" />;
      case "reading": return <BookOpen className="w-5 h-5" />;
      case "writing": return <BarChart3 className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'evaluated': return 'text-green-600 bg-green-50 border-green-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center text-red-600">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Error loading results: {error}</p>
            <button 
              onClick={fetchResults}
              className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg"
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
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-3">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            My Assessment Results
          </h1>
          <p className="text-gray-600 font-inter">
            View your scores, feedback, and correct answers for all completed modules
          </p>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Modules"
              value={results.length}
              icon={<BookOpen className="w-5 h-5" />}
              color="blue"
            />
            <SummaryCard
              title="Completed"
              value={results.filter(r => r.status === 'evaluated').length}
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <SummaryCard
              title="Average Score"
              value={`${Math.round(results.reduce((acc, curr) => acc + curr.totalScore, 0) / results.length)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
            />
            <SummaryCard
              title="Pending Review"
              value={results.filter(r => r.status === 'submitted').length}
              icon={<Clock className="w-5 h-5" />}
              color="yellow"
            />
          </div>
        )}

        {/* Results List */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-poppins font-semibold text-gray-900 mb-2">
                No Results Yet
              </h3>
              <p className="text-gray-600 font-inter">
                Complete some assessment modules to see your results here.
              </p>
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
      </div>
    </Layout>
  );
}

const SummaryCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  return (
    <div className={`bg-white rounded-xl p-6 border-2 ${colorClasses[color]} text-center`}>
      <div className="flex justify-center mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[0]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-poppins font-bold mb-1">{value}</div>
      <div className="text-sm font-inter text-gray-600">{title}</div>
    </div>
  );
};

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
      className={`bg-white rounded-2xl border-2 transition-all duration-300 animate-slide-up ${
        isExpanded ? 'border-primary-200 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggleModule}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
              {getModuleIcon(module)}
            </div>
            <div>
              <h3 className="text-xl font-poppins font-bold text-gray-900 capitalize">
                {module} Module
              </h3>
              <p className="text-gray-600 font-inter">
                {exam?.title || 'Assessment'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Score Display */}
            <div className="text-right">
              <div className="text-2xl font-poppins font-bold text-primary-600">
                {submission.totalScore} / {totalPossibleScore} pts
              </div>
              <div className="text-sm text-gray-600">
                {percentage}% • {submission.status}
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(submission.status)}`}>
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
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Your Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="space-y-6">
            {/* Submission Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="font-semibold text-gray-900">Submitted On</div>
                <div className="text-gray-600">
                  {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="font-semibold text-gray-900">Total Questions</div>
                <div className="text-gray-600">{submission.responses.length}</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="font-semibold text-gray-900">Time Taken</div>
                <div className="text-gray-600">-- mins</div>
              </div>
            </div>

            {/* Responses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-poppins font-semibold text-gray-900">
                  Question Details
                </h4>
                <button
                  onClick={() => onToggleAnswers(submission._id)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
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

              {submission.responses.map((response, responseIndex) => (
                <ResponseItem
                  key={responseIndex}
                  response={response}
                  index={responseIndex}
                  showCorrectAnswer={showAnswers[submission._id]}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const ResponseItem = ({ response, index, showCorrectAnswer }) => {
  const isCorrect = response.score > 0 && response.feedback === 'Correct';
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </div>
          <span className="font-semibold text-gray-900">Question {index + 1}</span>
        </div>
        <div className="text-sm font-medium">
          Score: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
            {response.score}/{response.maxScore || 5}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Student's Answer */}
        <div>
          <label className="text-sm font-medium text-gray-700">Your Answer:</label>
          <div className="mt-1 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-900">{response.answer || 'No answer provided'}</p>
          </div>
        </div>

        {/* Feedback */}
        {response.feedback && (
          <div>
            <label className="text-sm font-medium text-gray-700">Feedback:</label>
            <div className={`mt-1 p-3 rounded-lg ${
              isCorrect ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
            }`}>
              <p className="text-sm">{response.feedback}</p>
            </div>
          </div>
        )}

        {/* Correct Answer (if shown) */}
        {showCorrectAnswer && response.task && response.task.correctAnswer && (
          <div>
            <label className="text-sm font-medium text-gray-700">Correct Answer:</label>
            <div className="mt-1 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">{response.task.correctAnswer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this icon component
const Share = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

export default MyResult;