import React from "react";

 export const FeedbackTextarea = React.memo(({
    taskId,
    questionId,
    value,
    onChange
  }: {
    taskId: string;
    questionId: string | undefined;
    value: string;
    onChange: (taskId: string, questionId: string | undefined, value: string) => void;
  }) => {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(taskId, questionId, e.target.value)}
        rows={3}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-inter"
        placeholder="Provide constructive feedback..."
      />
    );
  });