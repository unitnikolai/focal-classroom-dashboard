"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Student } from "./types";
import { Modal } from "@/components/ui/modal";

interface DeviceListProps {
  students: Student[];
  onUnblock: (studentIds: string[]) => void;
}

function formatStatusSince(statusSince: string | undefined): string | null {
  if (!statusSince) return null;
  const diffMs = Date.now() - new Date(statusSince).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const date = new Date(statusSince);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function StatusDot({ status }: { status: Student["deviceStatus"] }) {
  const color =
    status === "active"
      ? "bg-success-500"
      : status === "inactive"
      ? "bg-warning-400"
      : "bg-gray-300 dark:bg-gray-600";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

function StatusLabel({ status, statusSince }: { status: Student["deviceStatus"]; statusSince?: string }) {
  const sinceStr = formatStatusSince(statusSince);
  const label =
    status === "active"
      ? sinceStr ? `Active since ${sinceStr}` : "Active"
      : status === "inactive"
      ? sinceStr ? `Inactive since ${sinceStr}` : "Inactive"
      : "Not set up";
  const textColor =
    status === "active"
      ? "text-success-600 dark:text-success-400"
      : status === "inactive"
      ? "text-warning-600 dark:text-orange-400"
      : "text-gray-400 dark:text-gray-500";
  return <span className={`text-sm ${textColor}`}>{label}</span>;
}

export default function DeviceList({ students, onUnblock }: DeviceListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (s.deviceStatus === "unactivated") return false;
      if (filterStatus !== "all" && s.deviceStatus !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.deviceName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, search, filterStatus]);

  const activeIds = useMemo(
    () => new Set(filtered.filter((s) => s.deviceStatus === "active").map((s) => s.id)),
    [filtered]
  );

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  }, [allSelected, filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedActiveIds = useMemo(
    () => [...selected].filter((id) => activeIds.has(id)),
    [selected, activeIds]
  );

  const handleUnblockSelected = () => {
    if (selectedActiveIds.length > 0) {
      onUnblock(selectedActiveIds);
      setSelected(new Set());
    }
  };

  const handleUnblockAll = () => {
    setConfirmOpen(true);
  };

  const confirmUnblockAll = () => {
    onUnblock([...activeIds]);
    setSelected(new Set());
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 md:px-6 md:pt-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Devices
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Manage connected users and device access
          </p>

          {/* Search + Filter */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search devices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 dark:focus:border-brand-500 dark:focus:ring-brand-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:border-gray-700 dark:text-gray-300 dark:focus:border-brand-500 dark:focus:ring-brand-500"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Bulk actions */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Select all
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUnblockSelected}
                disabled={selectedActiveIds.length === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Unblock selected
              </button>
              <button
                onClick={handleUnblockAll}
                disabled={activeIds.size === 0}
                className="rounded-lg border border-warning-200 px-3 py-1.5 text-sm font-medium text-warning-600 transition hover:bg-warning-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-warning-500/30 dark:text-orange-400 dark:hover:bg-warning-500/10"
              >
                Unblock all
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] md:px-6"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(student.id)}
                onChange={() => toggleOne(student.id)}
                className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
              />

              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {student.name}
                </p>
              </div>

              {/* Device */}
              <div className="hidden min-w-0 flex-1 sm:block">
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {student.deviceName}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 min-w-[90px]">
                <StatusDot status={student.deviceStatus} />
                <StatusLabel status={student.deviceStatus} statusSince={student.statusSince} />
              </div>

              {/* Action */}
              <div className="w-20 flex justify-end relative">
                {student.deviceStatus === "active" ? (
                  <button
                    onClick={() => onUnblock([student.id])}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Unblock
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === student.id ? null : student.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                    {menuOpenId === student.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpenId(null)}
                        />
                        <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <button
                            onClick={() => setMenuOpenId(null)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                          >
                            View details
                          </button>
                          <button
                            onClick={() => setMenuOpenId(null)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                          >
                            Remove device
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
              No devices match your search.
            </div>
          )}
        </div>
      </div>

      {/* Unblock All Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} className="max-w-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Unblock all devices?
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This will unblock {activeIds.size} active device
            {activeIds.size !== 1 ? "s" : ""}. This action can be reversed.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              onClick={confirmUnblockAll}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Unblock all
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
