"use client";
import React, { useEffect, useState } from "react";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { ActivitySegment } from "@/hooks/useActivityReport";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ActivityTimelineProps {
  users: { userId: string; name: string }[];
  segments: ActivitySegment[];
  rangeStart: Date;
  rangeEnd: Date;
}

const ACTIVE_COLOR = "#12b76a";
const INACTIVE_COLOR = "#fdb022";
const NO_DATA_COLOR = "#e4e7ec";
const ROW_HEIGHT = 56;
const MAIN_CHART_ID = "activity-timeline-main";

interface ViewRange {
  min: number;
  max: number;
}

// Tolerance below which two view windows are treated as "the same" — avoids
// feeding a no-op update back into React on every live-data re-render.
const RANGE_EPSILON_MS = 1000;

function rangesEqual(a: ViewRange, b: ViewRange) {
  return Math.abs(a.min - b.min) < RANGE_EPSILON_MS && Math.abs(a.max - b.max) < RANGE_EPSILON_MS;
}

export default function ActivityTimeline({ users, segments, rangeStart, rangeEnd }: ActivityTimelineProps) {
  const rangeStartMs = rangeStart.getTime();
  const rangeEndMs = rangeEnd.getTime();

  const [viewRange, setViewRange] = useState<ViewRange>({ min: rangeStartMs, max: rangeEndMs });

  const updateViewRange = (next: ViewRange) => {
    setViewRange((prev) => (rangesEqual(prev, next) ? prev : next));
  };

  // A new day was selected — snap the view back to the full day rather than
  // keeping a stale zoom window. Depends on primitive timestamps, not the
  // Date objects, since the parent recreates those on every render even when
  // the day hasn't changed.
  useEffect(() => {
    updateViewRange({ min: rangeStartMs, max: rangeEndMs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStartMs, rangeEndMs]);

  const isZoomed = !rangesEqual(viewRange, { min: rangeStartMs, max: rangeEndMs });
  const resetToDefaultView = () => updateViewRange({ min: rangeStartMs, max: rangeEndMs });

  const nameByUserId = new Map(users.map((u) => [u.userId, u.name]));
  const coveredUserIds = new Set(segments.map((s) => s.user_id));

  const toPoint = (s: ActivitySegment) => ({
    x: nameByUserId.get(s.user_id),
    y: [new Date(s.start).getTime(), new Date(s.end).getTime()],
  });

  const activeData = segments.filter((s) => nameByUserId.has(s.user_id) && s.status === "active").map(toPoint);
  const inactiveData = segments.filter((s) => nameByUserId.has(s.user_id) && s.status !== "active").map(toPoint);
  const noDataData = users
    .filter((u) => !coveredUserIds.has(u.userId))
    .map((u) => ({ x: u.name, y: [rangeStart.getTime(), rangeStart.getTime() + 60000] }));

  const options: ApexOptions = {
    colors: [ACTIVE_COLOR, INACTIVE_COLOR, NO_DATA_COLOR],
    chart: {
      id: MAIN_CHART_ID,
      fontFamily: "Outfit, sans-serif",
      type: "rangeBar",
      height: Math.max(150, users.length * ROW_HEIGHT),
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: false,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          // Disabled in favor of the explicit "Reset to default view" button
          // below — the built-in reset targets whatever ApexCharts considers
          // the chart's original bounds internally, which can drift out of
          // sync with our own controlled viewRange state.
          reset: false,
        },
        autoSelected: "zoom",
      },
      events: {
        // Keep the visible window in React state so a live-data re-render
        // (segments changing every ~30s) doesn't reset a zoom the user set.
        zoomed: (_ctx, { xaxis }) => updateViewRange({ min: xaxis.min, max: xaxis.max }),
        scrolled: (_ctx, { xaxis }) => updateViewRange({ min: xaxis.min, max: xaxis.max }),
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
        rangeBarGroupRows: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: "datetime",
      min: viewRange.min,
      max: viewRange.max,
      labels: {
        datetimeUTC: false,
        format: "HH:mm",
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "13px" },
      },
    },
    grid: {
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      x: {
        format: "MMM d, HH:mm",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
  };

  const series = [
    { name: "Active", data: activeData },
    { name: "Inactive", data: inactiveData },
    { name: "No data", data: noDataData },
  ];

  return (
    <div className="space-y-2">
      {isZoomed && (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={resetToDefaultView}
            className="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Reset to default view
          </button>
        </div>
      )}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px]">
          <ReactApexChart
            options={options}
            series={series}
            type="rangeBar"
            height={Math.max(150, users.length * ROW_HEIGHT)}
          />
        </div>
      </div>
    </div>
  );
}
