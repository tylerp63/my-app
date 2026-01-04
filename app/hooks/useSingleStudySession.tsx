import React from "react";
import { supabase } from "../utils/supabase";

type SingleStudySessionResult = {
  durationSec: number | null;
  loading: boolean;
  error: string | null;
};

export default function useSingleStudySession(
  id?: string
): SingleStudySessionResult {
  const [durationSec, setDurationSec] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof id !== "string") {
      setError("Invalid session id");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadSession() {
      setLoading(true);
      const { data, error } = await supabase
        .from("study_sessions")
        .select("duration_sec")
        .eq("id", id)
        .single();

      if (!isMounted) return;

      if (error) {
        setError(error.message);
      } else {
        setDurationSec(data.duration_sec);
      }

      setLoading(false);
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { durationSec, loading, error };
}
