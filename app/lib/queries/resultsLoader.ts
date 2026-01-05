import { getSessionAllocations } from "./allocations";
import { listStudyPlaces } from "./places";
import { getStudySession } from "./sessions";
import { listSubjects } from "./subjects";
import { listTasks } from "./tasks";

export async function loadResultsData(sessionId: string) {
    const [sessionRes, allocRes, placesRes, subjectsRes, tasksRes] =
        await Promise.all([
            getStudySession(sessionId),
            getSessionAllocations(sessionId),
            listStudyPlaces({ limit: 100 }),
            listSubjects({ limit: 200 }),
            listTasks({ limit: 200, includeCompleted: true }),
        ]);

    if (sessionRes.error) throw sessionRes.error;
    if (allocRes.error) throw allocRes.error;
    if (placesRes.error) throw placesRes.error;
    if (subjectsRes.error) throw subjectsRes.error;
    if (tasksRes.error) throw tasksRes.error;

    return {
        session: sessionRes.data,
        allocations: allocRes.data ?? [],
        places: placesRes.data ?? [],
        subjects: subjectsRes.data ?? [],
        tasks: tasksRes.data ?? [],
    };
}
