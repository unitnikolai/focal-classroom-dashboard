"use client";
import React, { useEffect, useState } from "react";

interface SessionInfoProps {
  className: string;
  period: string;
  startTime: string;
  enrolled: number;
}

function useElapsedTime(startTime: string): string {
  const [elapsed, setElapsed] = useState("0 min");

  useEffect(() => {
    const compute = () => {
      const [time, meridiem] = startTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let h = hours;
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      const start = new Date();
      start.setHours(h, minutes, 0, 0);
      const diffMs = Date.now() - start.getTime();
      const diffMin = Math.max(0, Math.floor(diffMs / 60000));
      if (diffMin < 60) return `${diffMin} min`;
      const hrs = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      return `${hrs}h ${mins}m`;
    };
    setElapsed(compute());
    const interval = setInterval(() => setElapsed(compute()), 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

export default function SessionInfo({ className: cls, period, startTime, enrolled }: SessionInfoProps) {
  const elapsed = useElapsedTime(startTime);

  const rows = [
    { label: "Class",    value: cls                  },
    { label: "Period",   value: period               },
    { label: "Started",  value: startTime            },
    { label: "Duration", value: elapsed              },
    { label: "Enrolled", value: `${enrolled} students` },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
        Session info
      </h3>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
