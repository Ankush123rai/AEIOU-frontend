// hooks/useExamAccess.ts
import { useExam } from '@/contexts/ExamContext';

export const useExamAccess = (level: string) => {
  const { getExamAccess } = useExam();
  const examAccess = getExamAccess(level);
  
  return {
    hasAccess: examAccess?.hasAccess || false,
    hasUnlocked: examAccess?.hasUnlocked || false,
    isCompleted: examAccess?.isCompleted || false,
    needsPayment: examAccess?.needsPayment || false,
    examId: examAccess?.exam._id,
    examTitle: examAccess?.exam.title,
    examLevel: examAccess?.exam.level,
  };
};

