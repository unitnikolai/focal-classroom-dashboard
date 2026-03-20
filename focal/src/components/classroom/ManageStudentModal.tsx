"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Student, StudentExemption } from "./types";

interface ManageStudentModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (studentId: string, exemption: StudentExemption | undefined) => void;
}

const RESTRICTION_ITEMS: { key: keyof StudentExemption; label: string; desc: string }[] = [
  { key: "socialMedia", label: "Social media",  desc: "Instagram, TikTok, X"   },
  { key: "games",       label: "Games",         desc: "App category block"     },
  { key: "messaging",   label: "Messaging",     desc: "iMessage, WhatsApp"     },
  { key: "browsers",    label: "Browsers",      desc: "Safari, Chrome"         },
];

const DEFAULT_EXEMPTION: StudentExemption = {
  socialMedia: false,
  games:       false,
  messaging:   false,
  browsers:    false,
};

export default function ManageStudentModal({
  student,
  isOpen,
  onClose,
  onApply,
}: ManageStudentModalProps) {
  const [toggles, setToggles] = useState<StudentExemption>(DEFAULT_EXEMPTION);

  useEffect(() => {
    if (student) {
      setToggles(student.exemption ?? DEFAULT_EXEMPTION);
    }
  }, [student]);

  if (!student) return null;

  const handleToggle = (key: keyof StudentExemption) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    const allBlocked = Object.values(toggles).every((v) => v === false);
    onApply(student.id, allBlocked ? undefined : toggles);
    onClose();
  };

  const handleRemoveExemption = () => {
    onApply(student.id, undefined);
    onClose();
  };

  const anyUnblocked = Object.values(toggles).some((v) => v === true);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {student.name}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {student.deviceName} ·{" "}
          {student.exemption ? (
            <span className="text-brand-500 font-medium">Currently exempted</span>
          ) : (
            <span className="capitalize">{student.deviceStatus}</span>
          )}
        </p>
      </div>

      <p className="mb-4 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">
        Lift restrictions for this student
      </p>

      <div className="space-y-1">
        {RESTRICTION_ITEMS.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={toggles[key]}
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                toggles[key]
                  ? "bg-brand-500"
                  : "bg-gray-200 dark:bg-white/10"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  toggles[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {anyUnblocked && (
        <p className="mt-3 text-xs text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-500/10 rounded-lg px-3 py-2">
          Turning on a toggle lifts that restriction for this student only.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {student.exemption && (
          <button
            onClick={handleRemoveExemption}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Remove exemption
          </button>
        )}
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Apply
        </button>
      </div>
    </Modal>
  );
}