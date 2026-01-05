import { supabase } from "@/app/utils/supabase";
import { StudySessionSubjectInsert } from "./types";

export function getSessionAllocations(sessionId: string) {
    return supabase
        .from("study_session_subjects")
        .select("*")
        .eq("session_id", sessionId);
}

/**
 * Upsert allocations for a session.
 * Assumes you have a composite PK (session_id, subject_id) or unique constraint.
 */
export function upsertSessionAllocations(rows: StudySessionSubjectInsert[]) {
    return supabase
        .from("study_session_subjects")
        .upsert(rows, { onConflict: "session_id,subject_id" })
        .select("*");
}

/**
 * Delete allocations for a session NOT IN the provided subject ids.
 * Call this after upsert if you want removals reflected in DB.
 */
export function deleteAllocationsNotIn(
    sessionId: string,
    keepSubjectIds: string[],
) {
    // If keepSubjectIds is empty, delete all allocations for the session.
    let q = supabase.from("study_session_subjects").delete().eq(
        "session_id",
        sessionId,
    );

    if (keepSubjectIds.length > 0) {
        q = q.not(
            "subject_id",
            "in",
            `(${keepSubjectIds.map((id) => `"${id}"`).join(",")})`,
        );
    }

    return q;
}
