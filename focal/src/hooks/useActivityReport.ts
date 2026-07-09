"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/auth-client";
import { Student } from "@/components/classroom/types";

export interface ActivitySegment {
  user_id: string;
  status: string; // "active" | "inactive"
  start: string; // ISO
  end: string; // ISO
}

const REFETCH_INTERVAL_MS = 5 * 60 * 1000; // keep historical segments fresh

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Module-scope cache, keyed by day — survives unmount/remount of the Reports
// page (e.g. navigating to Dashboard and back) since it lives outside any
// component. A day that's already been fetched once this session shows
// instantly from cache while a fresh fetch refreshes it in the background,
// instead of blanking back to a loading state.
const reportCache = new Map<string, { segments: ActivitySegment[]; fetchedAt: Date }>();

function cacheKey(day: Date) {
  return startOfDay(day).toISOString();
}

/**
 * Active/inactive segments for a single calendar day, backed by the raw
 * session_report scan log. For "today", rangeEnd is capped at fetch time —
 * mergeLiveSegments bridges the gap between fetches using data already
 * flowing through useSessions, rather than opening a second subscription.
 */
export function useActivityReport(day: Date) {
  const key = cacheKey(day);
  const cached = reportCache.get(key);

  const [segments, setSegments] = useState<ActivitySegment[]>(cached?.segments ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date>(cached?.fetchedAt ?? new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      const now = new Date();
      const rangeStart = startOfDay(day);
      const rangeEnd = isSameDay(day, now) ? now : endOfDay(day);
      const params = new URLSearchParams({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      });
      const res = await apiFetch(`/api/report/activity?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch activity report (${res.status})`);
      }
      const data = await res.json();
      const nextSegments = data.segments ?? [];
      setSegments(nextSegments);
      setFetchedAt(rangeEnd);
      setError(null);
      reportCache.set(cacheKey(day), { segments: nextSegments, fetchedAt: rangeEnd });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching activity report");
      console.error("Activity report fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    // Seed from cache (if any) for this specific day before kicking off a
    // background refresh, so switching days/pages never shows a blank state
    // for data we've already loaded once.
    const entry = reportCache.get(cacheKey(day));
    if (entry) {
      setSegments(entry.segments);
      setFetchedAt(entry.fetchedAt);
      setLoading(false);
    } else {
      setSegments([]);
      setLoading(true);
    }

    fetchReport();
    timerRef.current = setInterval(fetchReport, REFETCH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchReport, day]);

  return { segments, fetchedAt, loading, error, refetch: fetchReport };
}

/**
 * Bridges the gap between the last fetch and now for sessions that are still
 * open, using the live status/statusSince already streamed into `sessions`
 * by useSessions. Only meaningful when viewing today; callers should skip
 * this for past days since that data is already complete.
 */
export function mergeLiveSegments(
  segments: ActivitySegment[],
  sessions: Student[],
  fetchedAt: Date,
  now: Date
): ActivitySegment[] {
  if (now <= fetchedAt) return segments;

  const liveSegments: ActivitySegment[] = [];
  for (const session of sessions) {
    if (!session.userId || session.deviceStatus === "unactivated") continue;

    liveSegments.push({
      user_id: session.userId,
      status: session.deviceStatus === "active" ? "active" : "inactive",
      start: fetchedAt.toISOString(),
      end: now.toISOString(),
    });
  }

  return [...segments, ...liveSegments];
}
