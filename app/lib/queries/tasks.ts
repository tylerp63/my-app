import { supabase } from "@/app/utils/supabase";
import { TaskInsert, TaskUpdate } from "./types";

export function listTasks(params?: {
    limit?: number;
    includeCompleted?: boolean;
    subjectId?: string | null;
    onDate?: string; // YYYY-MM-DD for task_date filter
}) {
    const limit = params?.limit ?? 200;
    const includeCompleted = params?.includeCompleted ?? true;

    let q = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (!includeCompleted) q = q.eq("completed", false);

    if (params?.subjectId === null) {
        q = q.is("subject_id", null);
    } else if (params?.subjectId) {
        q = q.eq("subject_id", params.subjectId);
    }

    if (params?.onDate) {
        q = q.eq("task_date", params.onDate);
    }

    return q;
}

export function createTask(values: TaskInsert) {
    return supabase.from("tasks").insert(values).select("*").single();
}

export function updateTask(taskId: string, patch: TaskUpdate) {
    return supabase.from("tasks").update(patch).eq("id", taskId);
}

export function setTaskCompleted(taskId: string, completed: boolean) {
    const patch: TaskUpdate = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
    };
    return supabase.from("tasks").update(patch).eq("id", taskId);
}

export function deleteTask(taskId: string) {
    return supabase.from("tasks").delete().eq("id", taskId);
}
