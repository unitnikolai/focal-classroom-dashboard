"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { useSessionsContext } from "@/context/SessionsContext";
import { useActivityReport, mergeLiveSegments, startOfDay, endOfDay, isSameDay } from "@/hooks/useActivityReport";
import ActivityTimeline from "@/components/charts/bar/ActivityTimeline";
import { CalenderIcon } from "@/icons";

const LIVE_TICK_MS = 30000;

export default function ActivityReport() {
  const { sessions } = useSessionsContext();
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const { segments, fetchedAt, loading, error } = useActivityReport(selectedDay);
  const [now, setNow] = useState(() => new Date());
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d, Y",
      defaultDate: selectedDay,
      maxDate: new Date(),
      clickOpens: true,
      onChange: (dates) => {
        if (dates[0]) setSelectedDay(dates[0]);
      },
    });

    return () => {
      if (!Array.isArray(fp)) fp.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isToday = isSameDay(selectedDay, now);
  const liveSegments = useMemo(
    () => (isToday ? mergeLiveSegments(segments, sessions, fetchedAt, now) : segments),
    [isToday, segments, sessions, fetchedAt, now]
  );

  const users = useMemo(() => {
    const seen = new Map<string, string>();
    sessions.forEach((s) => {
      if (s.userId) seen.set(s.userId, s.name);
    });
    return Array.from(seen.entries()).map(([userId, name]) => ({ userId, name }));
  }, [sessions]);

  const rangeStart = startOfDay(selectedDay);
  const rangeEnd = endOfDay(selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Activity Timeline</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Active vs. inactive time per user for the selected day.
          </p>
        </div>
        <div className="relative inline-flex shrink-0 items-center">
          <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 shrink-0 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
          <input
            ref={datePickerRef}
            className="h-10 w-40 shrink-0 rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            placeholder="Select day"
          />
        </div>
      </div>

      {loading && users.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading activity report…</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {users.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <ActivityTimeline users={users} segments={liveSegments} rangeStart={rangeStart} rangeEnd={rangeEnd} />
        </div>
      )}

      {!loading && users.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No users to report on yet.</p>
      )}
    </div>
  );
}
