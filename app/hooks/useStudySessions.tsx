import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

type StudySession = {
  id: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
};

export default function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("study_sessions")
        .select("id, started_at, ended_at, duration_sec");

      if (!isMounted) return;

      if (error) {
        setSessions([]);
        setError(error.message);
        setLoading(false);
        return;
      }

      setSessions((data as StudySession[]) ?? []);
      setLoading(false);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  return { sessions, loading, error };
}
