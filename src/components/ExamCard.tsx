import { Award, ChevronRight } from 'lucide-react';

const ExamCard = ({ exam, onSelect }) => {
    const totalTasks = exam.modules?.reduce((sum, module) => sum + (module.taskIds?.length || 0), 0) || 0;
  
    return (
      <div
        className="bg-white border-2 border-gray-200 hover:border-primary-300 rounded-xl p-6 cursor-pointer transition-all hover:shadow-md"
        onClick={onSelect}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            exam.level === 'Basic' ? 'bg-green-100 text-green-800' :
            exam.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {exam.level}
          </span>
        </div>
        
        <h4 className="text-lg font-poppins font-bold text-gray-900 mb-2">
          {exam.title}
        </h4>
        
        <p className="text-gray-600 text-sm font-inter mb-4">
          Complete all {exam.modules?.length || 0} modules to finish this assessment
        </p>
        
        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center justify-between">
            <span>Total Marks</span>
            <span className="font-semibold">{exam.totalMarks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Modules</span>
            <span className="font-semibold">{exam.modules?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Tasks</span>
            <span className="font-semibold">{totalTasks}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-primary-600 font-medium">
            <span>Select Assessment</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    );
  };

export default ExamCard
