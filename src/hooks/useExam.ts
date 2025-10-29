import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../services/client";


export type ExamTask = {
  _id: string;
  parentTaskId?: string;
  questionId?: string;
  module: "listening" | "speaking" | "reading" | "writing";
  title: string;
  question?: string;
  instruction?: string;
  content?: string;
  questions?: Array<{
    _id: string;
    question: string;
    options?: { id: string; text: string }[];
    points?: number;
  }>;
  options?: string[];
  mediaUrl?: string;
  passage?: string;
  points?: number;
  type?: string;
  isActive?: boolean;
  taskType: "multiple_choice" | "file_upload" | "video_response";
  questionType?: "multiple_choice" | "text_input" | "file_upload";
  maxFiles?: number;
  maxFileSize?: number;
};

type UiModule = {
  name: "listening" | "speaking" | "reading" | "writing";
  durationMinutes: number;
  bufferMinutes?: number;
  taskIds: ExamTask[];
};

export type Exam = {
  _id: string;
  title: string;
  level: string;
  modules: UiModule[];
  totalMarks: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
};

// ---------- Hook ----------
export function useExam() {
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const apiRes = await apiClient.getExams();
        const apiExam = apiRes?.data || apiRes;

        if (!apiExam) {
          setCurrentExam(null);
          return;
        }

        const modules: UiModule[] = apiExam.modules.map((module: any) => {
          let examTasks: ExamTask[] = [];

          if (module.name === "reading") {
            examTasks = module.taskIds.flatMap((task: any) => {
              // For reading, each question becomes a separate task item
              if (task.questions && task.questions.length > 0) {
                return task.questions.map((question: any) => ({
                  _id: `${task._id}:${question._id}`,
                  parentTaskId: task._id,
                  module: module.name,
                  title: task.title,
                  question: question.question,
                  instruction: task.instruction,
                  content: task.content,
                  options: question.options?.map((opt: any) => opt.text),
                  points: question.points || task.points,
                  taskType: task.taskType,
                  questionType: question.questionType,
                  isActive: task.isActive,
                  maxFiles: task.maxFiles,
                  maxFileSize: task.maxFileSize,
                }));
              }
              // Fallback for reading tasks without questions
              return [{
                _id: task._id,
                parentTaskId: task._id,
                module: module.name,
                title: task.title,
                instruction: task.instruction,
                content: task.content,
                points: task.points,
                taskType: task.taskType,
                isActive: task.isActive,
                maxFiles: task.maxFiles,
                maxFileSize: task.maxFileSize,
              }];
            });
          }

          else if (module.name === "listening") {
            examTasks = module.taskIds.flatMap((task: any) => {
              // For listening, each question becomes a separate task item
              if (task.questions && task.questions.length > 0) {
                return task.questions.map((question: any) => ({
                  _id: `${task._id}:${question._id}`,
                  parentTaskId: task._id,
                  module: module.name,
                  title: task.title,
                  question: question.question,
                  instruction: task.instruction,
                  options: question.options?.map((opt: any) => opt.text),
                  mediaUrl: task.mediaUrl,
                  points: question.points || task.points,
                  taskType: task.taskType,
                  questionType: question.questionType,
                  isActive: task.isActive,
                  maxFiles: task.maxFiles,
                  maxFileSize: task.maxFileSize,
                }));
              }
              // Fallback for listening tasks without questions
              return [{
                _id: task._id,
                parentTaskId: task._id,
                module: module.name,
                title: task.title,
                question: task.instruction || task.title,
                instruction: task.instruction,
                mediaUrl: task.mediaUrl,
                points: task.points,
                taskType: task.taskType,
                questionType: task.taskType === "multiple_choice" ? "multiple_choice" : "text_input",
                isActive: task.isActive,
                maxFiles: task.maxFiles,
                maxFileSize: task.maxFileSize,
              }];
            });
          }

          else if (module.name === "writing" || module.name === "speaking") {
            // For writing and speaking, each task is a single item
            examTasks = module.taskIds.map((task: any) => ({
              _id: task._id,
              parentTaskId: task._id,
              module: module.name,
              title: task.title,
              instruction: task.instruction,
              content: task.content,
              points: task.points,
              taskType: task.taskType,
              mediaUrl: task.imageUrl || task.mediaUrl,
              questionType: task.taskType === "file_upload" ? "file_upload" : 
                          task.taskType === "video_response" ? "video_response" : "text_input",
              isActive: task.isActive,
              maxFiles: task.maxFiles,
              maxFileSize: task.maxFileSize,
            }));
          }

          else {
            // Default for other modules
            examTasks = module.taskIds.map((task: any) => ({
              _id: task._id,
              parentTaskId: task._id,
              module: module.name,
              title: task.title,
              question: task.instruction || task.title,
              instruction: task.instruction,
              content: task.content,
              points: task.points,
              taskType: task.taskType,
              mediaUrl: task.imageUrl,
              questionType: task.taskType === "multiple_choice" ? "multiple_choice" : 
                          task.taskType === "file_upload" ? "file_upload" : "text_input",
              isActive: task.isActive,
              maxFiles: task.maxFiles,
              maxFileSize: task.maxFileSize,
            }));
          }

          return {
            name: module.name,
            durationMinutes: module.durationMinutes,
            bufferMinutes: module.bufferMinutes,
            taskIds: examTasks.filter((t) => t.isActive !== false),
          };
        });

        setCurrentExam({
          _id: apiExam._id,
          title: apiExam.title,
          level: apiExam.level,
          modules,
          totalMarks: apiExam.totalMarks,
          isActive: apiExam.isActive,
          createdBy: apiExam.createdBy,
          createdAt: apiExam.createdAt,
        });
      } catch (error: any) {
        console.error("Error fetching exam:", error);
        setErr(error?.message || "Failed to load exam");
        setCurrentExam(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getModule = useCallback(
    (name: UiModule["name"]) =>
      currentExam?.modules.find((m) => m.name === name),
    [currentExam]
  );

  return { currentExam, loading, err, getModule };
}