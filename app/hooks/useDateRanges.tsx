import { useMemo } from "react";

type DateRanges = {
  weekStart: Date;
  weekEnd: Date;
  monthStart: Date;
  monthEnd: Date;
};
export default function useDateRanges(now: Date = new Date()): DateRanges {
  return useMemo(() => {
    // Week range (Monday 00:00 local time -> next Monday 00:00)
    const weekStart = new Date(now);
    const day = weekStart.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const diffToMonday = (day + 6) % 7; // 0 if Monday, 1 if Tuesday, ... 6 if Sunday
    weekStart.setDate(weekStart.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Month range (1st of month 00:00 -> 1st of next month 00:00)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return { weekStart, weekEnd, monthStart, monthEnd };
  }, [now]);
}
