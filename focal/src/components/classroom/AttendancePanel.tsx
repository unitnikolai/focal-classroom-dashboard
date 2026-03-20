"use client";
import React from "react";
import { Student } from "./types";

interface AttendancePanelProps {
  students: Student[];
}

function AttendanceBadge({ status }: { status: Student["attendanceStatus"] }) {
  if (status === "present")
    return (
      <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
        Present
      </span>
    );
  if (status === "late")
    return (
      <span className="inline-flex items-center rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
        Late
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-white/50">
      Absent
    </span>
  );
}

function attendanceSubtext(student: Student): string {
  if (student.attendanceStatus === "present" && student.joinTime)
    return `Joined ${student.joinTime}`;
  if (student.deviceStatus === "inactive") return "Device not connected";
  if (student.deviceStatus === "unactivated") return "App not installed";
  return "—";
}

export default function AttendancePanel({ students }: AttendancePanelProps) {
  const present = students.filter((s) => s.attendanceStatus !== "absent").length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Attendance
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Today&apos;s session check-ins
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
          {present} / {students.length} present
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {student.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {attendanceSubtext(student)}
                </p>
              </div>
            </div>
            <AttendanceBadge status={student.attendanceStatus} />
          </div>
        ))}
      </div>
    </div>
  );
}
