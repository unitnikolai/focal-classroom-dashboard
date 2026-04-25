"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Student } from "./types";
import { useSessions } from "@/hooks/useSessions";
import DeviceList from "./DeviceList";
import StatCards from "./StatCards";

export default function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { sessions, loading, error } = useSessions(5000);
  const [students, setStudents] = useState<Student[]>([]);

  React.useEffect(() => {
    setStudents(sessions);
  }, [sessions]);

  // Derive unique groups from session data
  const groups = useMemo(() => {
    const groupIds = new Set<string>();
    students.forEach((s) => {
      if (s.groupId) groupIds.add(s.groupId);
    });
    return Array.from(groupIds).sort();
  }, [students]);

  // Filter students by active tab
  const filtered = useMemo(() => {
    if (activeTab === "all") return students;
    return students.filter((s) => s.groupId === activeTab);
  }, [students, activeTab]);

  const handleUnblock = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setStudents((prev) =>
      prev.map((s) =>
        idSet.has(s.id) && s.deviceStatus === "inactive"
          ? { ...s, deviceStatus: "active" as const }
          : s
      )
    );
  }, []);

  // Truncate group IDs for display (first 8 chars)
  function groupLabel(groupId: string): string {
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

      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
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
          {groups.map((groupId) => {
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
        </nav>
      </div>

      {/* Tab content */}
      <DeviceList students={filtered} onUnblock={handleUnblock} />
    </div>
  );
}
