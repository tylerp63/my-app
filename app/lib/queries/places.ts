import { supabase } from "@/app/utils/supabase";
import { StudyPlaceInsert, StudyPlaceUpdate } from "./types";

export function listStudyPlaces(params?: { limit?: number }) {
    const limit = params?.limit ?? 100;
    return supabase
        .from("study_places")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(limit);
}

export function createStudyPlace(values: StudyPlaceInsert) {
    return supabase.from("study_places").insert(values).select("*").single();
}

export function updateStudyPlace(placeId: string, patch: StudyPlaceUpdate) {
    return supabase.from("study_places").update(patch).eq("id", placeId);
}

/**
 * Upsert by (user_id, google_place_id) if you use that unique constraint.
 * If google_place_id is null, this behaves like a normal insert (may duplicate).
 */
export async function upsertGooglePlace(values: StudyPlaceInsert) {
    return supabase
        .from("study_places")
        .upsert(values, { onConflict: "user_id,google_place_id" })
        .select("*")
        .single();
}
