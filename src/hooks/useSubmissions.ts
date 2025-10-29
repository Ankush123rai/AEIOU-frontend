import { useEffect, useState, useCallback } from "react";
import { apiClient, MySubmission } from "../services/client";

export function useSubmissions(examId?: string) {
  const [subs, setSubs] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchSubs = useCallback(async () => {
    if (!examId) return; 
    setLoading(true);
    try {
      const data = await apiClient.fetchMySubmissions();
      setSubs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const isSubmitted = useCallback(
    (module: string) => {
      if (!examId || !subs?.length) return false;
      return subs.some(
        (s) =>
          s.examId === examId &&
          s.module?.toLowerCase() === module.toLowerCase() &&
          s.status === "submitted"
      );
    },
    [subs, examId]
  );

  return { subs, isSubmitted, loading, err };
}
