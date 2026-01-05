import { useMemo } from "react";

type StudySession = {
  id: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
};

type DateRanges = {
  weekStart: Date;
  weekEnd: Date;
  monthStart: Date;
  monthEnd: Date;
};
export default function useSessionDerivedData(
  sessions: StudySession[],
  ranges: DateRanges
) {
  const startTimes = useMemo(() => {
    const monthlySessions = sessions.filter((s) => {
      const started = new Date(s.started_at);
      return started >= ranges.monthStart && started < ranges.monthEnd;
    });

    return monthlySessions.map((s) => s.started_at);
  }, [sessions, ranges.monthStart, ranges.monthEnd]);

  const totalSec = useMemo(() => {
    const weeklySessions = sessions.filter((s) => {
      const started = new Date(s.started_at);
      return started >= ranges.weekStart && started < ranges.weekEnd;
    });

    return weeklySessions.reduce((acc, s) => acc + (s.duration_sec ?? 0), 0);
  }, [sessions, ranges.weekStart, ranges.weekEnd]);

  return { startTimes, totalSec };
}
