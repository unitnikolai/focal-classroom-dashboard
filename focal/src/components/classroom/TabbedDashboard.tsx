"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Student } from "./types";
import { useSessionsContext } from "@/context/SessionsContext";
import { useGroups } from "@/hooks/useGroups";
import { apiFetch } from "@/lib/auth-client";
import DeviceList from "./DeviceList";
import StatCards from "./StatCards";

// Sentinel tab id for devices that have no group. Prefixed so it can never
// collide with a real group_id.
const UNGROUPED = "__ungrouped__";

export default function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { sessions, loading, error, refetch } = useSessionsContext();
  const [commandError, setCommandError] = useState<string | null>(null);
  const { groups: orgGroups, groupNames } = useGroups();
  // Seeded from context (not []) so remounting this page — e.g. navigating to
  // Reports and back — shows the already-loaded session data immediately
  // instead of flashing empty for a render while the sync effect below runs.
  const [students, setStudents] = useState<Student[]>(sessions);

  React.useEffect(() => {
    setStudents(sessions);
  }, [sessions]);

  // Build the tab list from the org's authoritative group list (the groups
  // API via useGroups), so an org admin sees every group in their organization
  // as its own tab — even a group that has no active session yet. Then append
  // any group_id that shows up on a session but isn't in the org list (e.g. a
  // since-deleted group) so those devices are never silently hidden.
  const groupIds = useMemo(() => {
    const ids = orgGroups.map((g) => g.id);
    const known = new Set(ids);
    students.forEach((s) => {
      if (s.groupId && !known.has(s.groupId)) {
        known.add(s.groupId);
        ids.push(s.groupId);
      }
    });
    return ids;
  }, [orgGroups, students]);

  // Devices with no group still need a home so an admin can act on them.
  const hasUngrouped = useMemo(() => students.some((s) => !s.groupId), [students]);

  // Filter students by active tab
  const filtered = useMemo(() => {
    if (activeTab === "all") return students;
    if (activeTab === UNGROUPED) return students.filter((s) => !s.groupId);
    return students.filter((s) => s.groupId === activeTab);
  }, [students, activeTab]);

  // Dashboard Student.id === session_id (see mapSessionToStudent), so the ids
  // handed to us are exactly the sessions to command. Dispatch is synchronous:
  // the backend returns which devices it reached (`sent`) and which it didn't
  // (`failed`). We optimistically flip the targeted devices to "inactive" (the
  // state a device lands in once it lifts its block and reports back), then
  // revert any that failed so they stay active and the admin can re-select and
  // resend them. The live onSessionUpdated subscription reconciles each row to
  // the real device state once the command is actually applied.
  const handleUnblock = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    setCommandError(null);
    const idSet = new Set(ids);
    setStudents((prev) =>
      prev.map((s) =>
        idSet.has(s.id) && s.deviceStatus === "active"
          ? { ...s, deviceStatus: "inactive" as const }
          : s
      )
    );

    try {
      const res = await apiFetch("/api/session/command", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ command: "unblock", session_ids: ids }),
      });
      const body = await res.json().catch(() => ({} as { failed?: string[]; error?: string }));

      // A structured response always carries a `failed` array (200/207/502).
      // Anything else (auth/validation/gateway error) is a hard failure.
      if (!Array.isArray(body.failed)) {
        throw new Error(body.error ?? `Failed to send unblock (${res.status})`);
      }

      if (body.failed.length > 0) {
        const failedSet = new Set(body.failed);
        setStudents((prev) =>
          prev.map((s) =>
            failedSet.has(s.id) ? { ...s, deviceStatus: "active" as const } : s
          )
        );
        setCommandError(
          `Couldn't unblock ${body.failed.length} device${body.failed.length === 1 ? "" : "s"}. Select and try again.`
        );
      }
    } catch (err) {
      setCommandError(err instanceof Error ? err.message : "Failed to send unblock");
      // Roll the optimistic change back to server truth.
      refetch();
    }
  }, [refetch]);

  // Prefer the real group name; fall back to a truncated ID if the name
  // hasn't loaded yet (or the group was since deleted).
  function groupLabel(groupId: string): string {
    const name = groupNames.get(groupId);
    if (name) return name;
    return groupId.length > 12 ? groupId.slice(0, 8) + "…" : groupId;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatCards students={filtered} />

      {loading && students.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions…</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {commandError && (
        <p className="text-sm text-red-500">{commandError}</p>
      )}

      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto sm:gap-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            }`}
          >
            All
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {students.length}
            </span>
          </button>
          {groupIds.map((groupId) => {
            const count = students.filter((s) => s.groupId === groupId).length;
            return (
              <button
                key={groupId}
                onClick={() => setActiveTab(groupId)}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === groupId
                    ? "border-brand-500 text-brand-600 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {groupLabel(groupId)}
                <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
                  {count}
                </span>
              </button>
            );
          })}
          {hasUngrouped && (
            <button
              onClick={() => setActiveTab(UNGROUPED)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === UNGROUPED
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Ungrouped
              <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
                {students.filter((s) => !s.groupId).length}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Tab content */}
      <DeviceList students={filtered} onUnblock={handleUnblock} />
    </div>
  );
}
