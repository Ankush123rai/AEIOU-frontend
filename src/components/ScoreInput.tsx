import React from "react";


export const ScoreInput = React.memo(({ 
    taskId, 
    questionId, 
    value, 
    maxPoints, 
    onChange 
  }: {
    taskId: string;
    questionId: string | undefined;
    value: number;
    maxPoints: number;
    onChange: (taskId: string, questionId: string | undefined, value: number) => void;
  }) => {
    return (
      <input
        type="number"
        min="0"
        max={maxPoints}
        value={value}
        onChange={(e) => onChange(taskId, questionId, parseInt(e.target.value) || 0)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
      />
    );
  });
  
