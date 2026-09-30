"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import flatpickr from "flatpickr";
import { useSessionsContext } from "@/context/SessionsContext";
import { useActivityReport, mergeLiveSegments, startOfDay, endOfDay, isSameDay } from "@/hooks/useActivityReport";
import ActivityTimeline, { TimeFormat } from "@/components/charts/bar/ActivityTimeline";
import { CalenderIcon } from "@/icons";

const LIVE_TICK_MS = 30000;

const TIME_FORMAT_KEY = "reportTimeFormat";
const DEFAULT_TIME_FORMAT: TimeFormat = "casual";

const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "standard", label: "Standard" },
];

export default function ActivityReport() {
  const { sessions } = useSessionsContext();
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const { segments, fetchedAt, loading, error } = useActivityReport(selectedDay);
  const [now, setNow] = useState(() => new Date());
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(DEFAULT_TIME_FORMAT);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  // Restore the saved preference on the client only, so the server render
  // always matches the default and avoids a hydration mismatch.
  useEffect(() => {
    const saved = localStorage.getItem(TIME_FORMAT_KEY);
    if (saved === "casual" || saved === "standard") setTimeFormat(saved);
  }, []);

  const changeTimeFormat = (next: TimeFormat) => {
    setTimeFormat(next);
    try {
      localStorage.setItem(TIME_FORMAT_KEY, next);
    } catch {
      // Ignore storage failures (e.g. private mode) — the choice still
      // applies for this session.
    }
  };

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
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Time format"
            className="inline-flex h-10 shrink-0 items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
          >
            {TIME_FORMAT_OPTIONS.map((option) => {
              const active = timeFormat === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeTimeFormat(option.value)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
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
      </div>

      {loading && users.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading activity report…</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {users.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <ActivityTimeline users={users} segments={liveSegments} rangeStart={rangeStart} rangeEnd={rangeEnd} timeFormat={timeFormat} />
        </div>
      )}

      {!loading && users.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No users to report on yet.</p>
      )}
    </div>
  );
}
