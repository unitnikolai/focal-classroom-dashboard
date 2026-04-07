"use client";
import React, { useState } from "react";
import { Student, DeviceFilter, StudentExemption } from "./types";
import ManageStudentModal from "./ManageStudentModal";

interface DeviceGridProps {
  students: Student[];
  onUpdateExemption: (studentId: string, exemption: StudentExemption | undefined) => void;
}

const FILTERS: { key: DeviceFilter; label: string }[] = [
  { key: "all",         label: "All"         },
  { key: "active",      label: "Active"      },
  { key: "exempted",    label: "Exempted"    },
  { key: "inactive",    label: "Inactive"    },
  { key: "unactivated", label: "Unactivated" },
];

function formatStatusSince(statusSince: string | undefined): string | null {
  if (!statusSince) return null;
  const diffMs = Date.now() - new Date(statusSince).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const date = new Date(statusSince);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getCardStyle(student: Student): string {
  if (student.exemption)
    return "border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/5";
  if (student.deviceStatus === "active")
    return "border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/5";
  if (student.deviceStatus === "inactive")
    return "border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/5";
  return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-white/[0.02]";
}

function StatusBadge({ student }: { student: Student }) {
  if (student.exemption)
    return (
      <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        Exempted
      </span>
    );
  if (student.deviceStatus === "active")
    return (
      <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
        Active
      </span>
    );
  if (student.deviceStatus === "inactive")
    return (
      <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
        Inactive
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-white/50">
      Not set up
    </span>
  );
}

export default function DeviceGrid({ students, onUpdateExemption }: DeviceGridProps) {
  const [filter, setFilter] = useState<DeviceFilter>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = students.filter((s) => {
    if (filter === "all")         return true;
    if (filter === "exempted")    return !!s.exemption;
    if (filter === "active")      return s.deviceStatus === "active" && !s.exemption;
    if (filter === "inactive")    return s.deviceStatus === "inactive";
    if (filter === "unactivated") return s.deviceStatus === "unactivated";
    return true;
  });

  const counts: Record<DeviceFilter, number> = {
    all:         students.length,
    active:      students.filter((s) => s.deviceStatus === "active" && !s.exemption).length,
    exempted:    students.filter((s) => !!s.exemption).length,
    inactive:    students.filter((s) => s.deviceStatus === "inactive").length,
    unactivated: students.filter((s) => s.deviceStatus === "unactivated").length,
  };

  const openManage = (student: Student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Device status
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Click &ldquo;Manage&rdquo; on any employee to customize their block
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-brand-500 text-white"
                    : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.03]"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    filter === key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((student) => (
            <div
              key={student.id}
              className={`rounded-xl border p-3 transition-all ${getCardStyle(student)}`}
            >
              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {student.deviceName}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {student.name}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-1">
                <StatusBadge student={student} />
                {student.deviceStatus !== "unactivated" && (
                  <button
                    onClick={() => openManage(student)}
                    className={`rounded-lg px-2 py-0.5 text-xs font-medium transition-colors ${
                      student.exemption
                        ? "border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:bg-transparent dark:text-brand-400"
                        : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400"
                    }`}
                  >
                    Manage
                  </button>
                )}
              </div>
              {student.deviceStatus !== "unactivated" && formatStatusSince(student.statusSince) && (
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  Since {formatStatusSince(student.statusSince)}
                </p>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No employees match this filter.
          </div>
        )}
      </div>

      <ManageStudentModal
        student={selectedStudent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={onUpdateExemption}
      />
    </>
  );
}