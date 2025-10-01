import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from './ProgressBar';
import clsx from 'clsx';

interface ModuleCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  progress: number;
  className?: string;
}

export function ModuleCard({ id, name, icon, progress, className }: ModuleCardProps) {
  const navigate = useNavigate();
  
  const isCompleted = progress === 100;
  const isStarted = progress > 0;

  return (
    <div className={clsx(
      'bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1',
      className
    )}>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className={clsx(
          'w-20 h-20 rounded-full flex items-center justify-center',
          isCompleted ? 'bg-secondary-100 text-secondary-600' : 'bg-gray-100 text-gray-600'
        )}>
          {icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-poppins font-bold text-gray-900">{name}</h3>
          <div className="w-24">
            <ProgressBar progress={progress} />
          </div>
          <p className="text-sm text-gray-500 font-inter">
            {isCompleted ? 'Completed' : isStarted ? `${progress}% Complete` : 'Not Started'}
          </p>
        </div>

        <button
          onClick={() => navigate(`/module/${id}`)}
          className={clsx(
            'px-8 py-3 rounded-xl font-inter font-medium transition-all duration-200',
            isCompleted
              ? 'bg-secondary-500 text-white hover:bg-secondary-600'
              : 'bg-primary-900 text-white hover:bg-primary-800'
          )}
        >
          {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'}
        </button>
      </div>
    </div>
  );
}