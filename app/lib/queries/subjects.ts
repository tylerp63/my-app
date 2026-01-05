import { supabase } from "@/app/utils/supabase";
import { SubjectInsert, SubjectUpdate } from "./types";

export function listSubjects(params?: { limit?: number }) {
    const limit = params?.limit ?? 200;
    return supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit);
}

export function createSubject(values: SubjectInsert) {
    return supabase.from("subjects").insert(values).select("*").single();
}

export function updateSubject(subjectId: string, patch: SubjectUpdate) {
    return supabase.from("subjects").update(patch).eq("id", subjectId);
}

export function deleteSubject(subjectId: string) {
    return supabase.from("subjects").delete().eq("id", subjectId);
}
