"use client";
import React, { useState, useCallback } from "react";
import { Student } from "./types";
import { MOCK_STUDENTS } from "./data";
import DeviceList from "./DeviceList";
import ClassroomDashboard from "./ClassroomDashboard";
import StatCards from "./StatCards";

const TABS = [
  { key: "devices", label: "Devices" },
  { key: "classroom", label: "Classroom" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("devices");
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatCards students={students} />

      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "devices" && (
        <DeviceList students={students} onUnblock={handleUnblock} />
      )}
      {activeTab === "classroom" && <ClassroomDashboard />}
    </div>
  );
}
