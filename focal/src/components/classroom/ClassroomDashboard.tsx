"use client";
import React, { useState, useCallback } from "react";
import { Student, GlobalBlock, StudentExemption } from "./types";
import { MOCK_STUDENTS } from "./data";
import StatCards from "./StatCards";
import DeviceGrid from "./DeviceGrid";
import BlockControls from "./BlockControls";
import AttendancePanel from "./AttendancePanel";
import SessionInfo from "./SessionInfo";
import { useProfile } from "@/hooks/useProfile";

const INITIAL_BLOCK: GlobalBlock = {
  isActive:    true,
  socialMedia: true,
  games:       true,
  messaging:   false,
  browsers:    true,
};

export default function ClassroomDashboard() {
  const { profile } = useProfile();
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [block, setBlock] = useState<GlobalBlock>(INITIAL_BLOCK);

  const handleBlockToggle = useCallback((key: keyof GlobalBlock) => {
    setBlock((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleEndBlock = useCallback(() => {
    setBlock((prev) => ({ ...prev, isActive: false }));
  }, []);

  const handleUpdateExemption = useCallback(
    (studentId: string, exemption: StudentExemption | undefined) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, exemption } : s))
      );
    },
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Good morning{profile ? `, ${profile.personalInfo.givenName}` : ''}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Period 3 — Computer Science · {students.length} students enrolled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Session active
          </span>
        </div>
      </div>

      <StatCards students={students} />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <DeviceGrid
            students={students}
            onUpdateExemption={handleUpdateExemption}
          />
          <AttendancePanel students={students} />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <BlockControls
            block={block}
            onToggle={handleBlockToggle}
            onEndBlock={handleEndBlock}
          />
          <SessionInfo
            className="Computer Science"
            period="Period 3"
            startTime="9:00 AM"
            enrolled={students.length}
          />
        </div>
      </div>
    </div>
  );
}
