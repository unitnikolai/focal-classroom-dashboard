"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Student, Group } from "./types";
import { MOCK_STUDENTS, MOCK_GROUPS } from "./data";
import DeviceList from "./DeviceList";
import StatCards from "./StatCards";

export default function GroupsDashboard() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [groups] = useState<Group[]>(MOCK_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id ?? "");

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId]
  );

  const groupStudents = useMemo(() => {
    if (!activeGroup) return [];
    const memberSet = new Set(activeGroup.memberIds);
    return students.filter((s) => memberSet.has(s.id));
  }, [students, activeGroup]);

  const handleUnblock = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setStudents((prev) =>
      prev.map((s) =>
        idSet.has(s.id) && s.deviceStatus === "active"
          ? { ...s, deviceStatus: "inactive" as const }
          : s
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Groups
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage devices by group · {groups.length} groups
        </p>
      </div>

      {/* Group selector tabs */}
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const memberSet = new Set(group.memberIds);
          const count = students.filter((s) => memberSet.has(s.id) && s.deviceStatus !== "unactivated").length;
          return (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeGroupId === group.id
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.03]"
              }`}
            >
              {group.name}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeGroupId === group.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats scoped to group */}
      {activeGroup && <StatCards students={groupStudents} />}

      {/* Device list scoped to group */}
      {activeGroup && (
        <DeviceList students={groupStudents} onUnblock={handleUnblock} />
      )}

      {groups.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No groups found. Create groups to manage devices by class or period.
          </p>
        </div>
      )}
    </div>
  );
}
