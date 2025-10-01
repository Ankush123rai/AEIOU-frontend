// hooks/useExamProgress.ts
import { useEffect, useMemo, useState } from "react";
import { Exam, fetchExams, fetchMySubmissions, MySubmission } from "@/lib/api";

export function useExamProgress() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [mySubs, setMySubs] = useState<MySubmission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [e, s] = await Promise.all([fetchExams(), fetchMySubmissions()]);
        setExams(e.filter((x) => x.isActive));
        setMySubs(s);
      } catch (err: any) {
        setError(err?.message || "Failed to load exam data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeExam = useMemo(() => exams[0] || null, [exams]);

  const moduleStatus = useMemo(() => {
    if (!activeExam) return {};
    const status: Record<
      string,
      { submitted: boolean; progressPct: number; totalTasks: number }
    > = {};
    for (const mod of activeExam.modules) {
      const sub = mySubs.find((m) => m.examId === activeExam._id && m.module === mod.name);
      const submitted = Boolean(sub);
      const totalTasks = mod.taskIds?.length ?? 0;

      // If there is a submission, consider 100%; else 0 (you can refine to partial later)
      const progressPct = submitted ? 100 : 0;
      status[mod.name] = { submitted, progressPct, totalTasks };
    }
    return status;
  }, [activeExam, mySubs]);

  const overallProgress = useMemo(() => {
    const mods = activeExam?.modules ?? [];
    if (!mods.length) return 0;
    const sum = mods
      .map((m) => moduleStatus[m.name]?.progressPct ?? 0)
      .reduce((a, b) => a + b, 0);
    return Math.round(sum / mods.length);
  }, [activeExam, moduleStatus]);

  return {
    loading,
    error,
    activeExam,
    exams,
    mySubs,
    moduleStatus,
    overallProgress,
  };
}
