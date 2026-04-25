"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/auth-client";
import { subscribeAppSync } from "@/lib/appsync-subscribe";
import { Student } from "@/components/classroom/types";

interface RawSession {
  session_id: string;
  user_id: string;
  full_name: string | null;
  org_id: string;
  group_id: string;
  device_name: string | null;
  created_at: string;
  status: string;
  status_since: string;
  ttl: number;
}

function mapSessionToStudent(session: RawSession): Student {
  const deviceStatus =
    session.status === "active"
      ? "active"
      : session.device_name
        ? "inactive"
        : "unactivated";

  const attendanceStatus =
    session.status === "active" ? "present" : session.device_name ? "late" : "absent";

  const joinTime = session.status === "active"
    ? new Date(session.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : undefined;

  return {
    id: session.session_id,
    name: session.full_name || session.user_id,
    deviceName: session.device_name ?? "Unknown device",
    deviceStatus,
    attendanceStatus,
    joinTime,
    statusSince: session.status_since,
    groupId: session.group_id || undefined,
  };
}

const ON_SESSION_UPDATED = `subscription OnSessionUpdated($org_id: String!) {
  onSessionUpdated(org_id: $org_id) {
    session_id
    user_id
    full_name
    org_id
    group_id
    device_name
    created_at
    status
    status_since
    ttl
  }
}`;

export function useSessions(pollInterval = 0) {
  const [sessions, setSessions] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiFetch("/api/session/pull");
      if (!res.ok) {
        throw new Error(`Failed to fetch sessions (${res.status})`);
      }
      const data = await res.json();
      const mapped = (data.sessions ?? []).map(mapSessionToStudent);
      setSessions(mapped);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching sessions");
      console.error("Session fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startSubscription = useCallback((attempt = 0) => {
    if (cancelledRef.current) return;

    apiFetch("/api/auth/appsync-token")
      .then((res) => res.json())
      .then(({ token, org_id }) => {
        if (cancelledRef.current || !token || !org_id) return;

        // Stop polling while WebSocket is active
        if (pollTimer.current) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
        }

        unsubRef.current = subscribeAppSync<RawSession>(
          token,
          ON_SESSION_UPDATED,
          { org_id },
          {
            onData: (session) => {
              if (!session) return;
              const student = mapSessionToStudent(session);
              setSessions((prev) => {
                const idx = prev.findIndex((s) => s.id === student.id);
                if (idx >= 0) {
                  const next = [...prev];
                  next[idx] = student;
                  return next;
                }
                return [...prev, student];
              });
            },
            onError: (err) => {
              console.warn("Subscription error:", JSON.stringify(err));
            },
            onClose: () => {
              if (cancelledRef.current) return;
              // Fetch latest data immediately on disconnect
              fetchSessions();
              // Start polling fallback
              if (pollInterval > 0 && !pollTimer.current) {
                pollTimer.current = setInterval(fetchSessions, pollInterval);
              }
              // Reconnect with backoff (1s, 2s, 4s, 8s… max 30s)
              const delay = Math.min(1000 * 2 ** attempt, 30000);
              reconnectTimer.current = setTimeout(() => startSubscription(attempt + 1), delay);
            },
          },
        );

        // Reset attempt counter on successful connection
        attempt = 0;
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        console.error("Failed to start subscription:", err);
        // Start polling fallback
        if (pollInterval > 0 && !pollTimer.current) {
          pollTimer.current = setInterval(fetchSessions, pollInterval);
        }
        const delay = Math.min(1000 * 2 ** attempt, 30000);
        reconnectTimer.current = setTimeout(() => startSubscription(attempt + 1), delay);
      });
  }, [fetchSessions, pollInterval]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchSessions();
    startSubscription();

    return () => {
      cancelledRef.current = true;
      unsubRef.current?.();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [fetchSessions, startSubscription]);

  return { sessions, loading, error, refetch: fetchSessions };
}
