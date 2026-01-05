import { supabase } from "@/app/utils/supabase";
import { StudySessionUpdate } from "./types";

export function getStudySession(sessionId: string) {
    return supabase
        .from("study_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
}

export function updateStudySession(
    sessionId: string,
    patch: StudySessionUpdate,
) {
    return supabase.from("study_sessions").update(patch).eq("id", sessionId);
}

// can get history of recent sessions
export function listStudySessions(
    params?: { limit?: number; from?: string; to?: string },
) {
    const limit = params?.limit ?? 50;

    let q = supabase
        .from("study_sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(limit);

    if (params?.from) q = q.gte("started_at", params.from);
    if (params?.to) q = q.lt("started_at", params.to);

    return q;
}
