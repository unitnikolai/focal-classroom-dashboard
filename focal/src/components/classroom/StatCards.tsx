"use client";
import React from "react";
import { Student } from "./types";

interface StatCardsProps {
  students: Student[];
}

export default function StatCards({ students }: StatCardsProps) {
  const present = students.filter((s) => s.attendanceStatus !== "absent").length;
  const activeDevices = students.filter(
    (s) => s.deviceStatus === "active" && !s.exemption
  ).length;
  const exempted = students.filter((s) => !!s.exemption).length;
  const unactivated = students.filter((s) => s.deviceStatus === "unactivated").length;

  const stats = [
    {
      label: "Present",
      value: present,
      sub: `of ${students.length} employees`,
      dotColor: "bg-success-500",
      textColor: "text-success-600 dark:text-success-400",
    },
    {
      label: "Devices active",
      value: activeDevices,
      sub: "block enforced",
      dotColor: "bg-success-500",
      textColor: "text-success-600 dark:text-success-400",
    },
    {
      label: "Exempted",
      value: exempted,
      sub: "partial unblock",
      dotColor: "bg-brand-500",
      textColor: "text-brand-500 dark:text-brand-400",
    },
    {
      label: "Unactivated",
      value: unactivated,
      sub: "app not set up",
      dotColor: "bg-gray-400",
      textColor: "text-gray-500 dark:text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          <h4 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {stat.value}
          </h4>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${stat.dotColor}`} />
            <span className={`text-xs ${stat.textColor}`}>{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
