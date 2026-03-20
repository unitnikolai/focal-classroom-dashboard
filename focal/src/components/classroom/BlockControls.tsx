"use client";
import React from "react";
import { GlobalBlock } from "./types";

interface BlockControlsProps {
  block: GlobalBlock;
  onToggle: (key: keyof GlobalBlock) => void;
  onEndBlock: () => void;
}

const RESTRICTION_ITEMS: { key: keyof Omit<GlobalBlock, "isActive">; label: string; desc: string }[] = [
  { key: "socialMedia", label: "Social media", desc: "Instagram, TikTok, X" },
  { key: "games",       label: "Games",        desc: "App category block"   },
  { key: "messaging",   label: "Messaging",    desc: "iMessage, WhatsApp"   },
  { key: "browsers",    label: "Browsers",     desc: "Safari, Chrome"       },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function BlockControls({ block, onToggle, onEndBlock }: BlockControlsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Focal block
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Global class restrictions
          </p>
        </div>
        {block.isActive ? (
          <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
            On
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-white/50">
            Off
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Block active</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">All restrictions on</p>
          </div>
          <ToggleSwitch checked={block.isActive} onChange={() => onToggle("isActive")} />
        </div>

        {RESTRICTION_ITEMS.map(({ key, label, desc }) => (
          <div
            key={key}
            className={`flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
              block.isActive
                ? "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                : "opacity-40 pointer-events-none"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
            </div>
            <ToggleSwitch
              checked={block[key]}
              onChange={() => onToggle(key)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onEndBlock}
        disabled={!block.isActive}
        className="mt-5 w-full rounded-xl border border-error-200 bg-error-50 px-4 py-2.5 text-sm font-medium text-error-600 transition hover:bg-error-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20"
      >
        End block for all students
      </button>
    </div>
  );
}
