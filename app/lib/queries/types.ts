/* ============================================================
   lib/queries/types.ts
   Centralized Supabase table types (optional but recommended)
   ============================================================ */

import { Database } from "@/database.types";

export type Tables = Database["public"]["Tables"];

export type StudySessionRow = Tables["study_sessions"]["Row"];
export type StudySessionInsert = Tables["study_sessions"]["Insert"];
export type StudySessionUpdate = Tables["study_sessions"]["Update"];

export type SubjectRow = Tables["subjects"]["Row"];
export type SubjectInsert = Tables["subjects"]["Insert"];
export type SubjectUpdate = Tables["subjects"]["Update"];

export type StudySessionSubjectRow = Tables["study_session_subjects"]["Row"];
export type StudySessionSubjectInsert =
    Tables["study_session_subjects"]["Insert"];
export type StudySessionSubjectUpdate =
    Tables["study_session_subjects"]["Update"];

export type StudyPlaceRow = Tables["study_places"]["Row"];
export type StudyPlaceInsert = Tables["study_places"]["Insert"];
export type StudyPlaceUpdate = Tables["study_places"]["Update"];

export type TaskRow = Tables["tasks"]["Row"];
export type TaskInsert = Tables["tasks"]["Insert"];
export type TaskUpdate = Tables["tasks"]["Update"];
