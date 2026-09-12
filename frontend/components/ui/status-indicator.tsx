"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "Draft"
  | "Published"
  | "Syncing"
  | "Synced"
  | "Ready"
  | "Failed"
  | "Pending"
  | "Escalated"
  | "Verified"
  | "Live"
  | "Unavailable";

interface StatusIndicatorProps {
  status: StatusType;
  showText?: boolean;
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function StatusIndicator({
  status,
  showText = true,
  pulse = false,
  className,
  size = "md",
}: StatusIndicatorProps) {
  const dotColor: Record<StatusType, string> = {
    Draft: "bg-[#9A9A95]",
    Published: "bg-emerald-500",
    Syncing: "bg-blue-500 animate-pulse",
    Synced: "bg-emerald-500",
    Ready: "bg-emerald-500",
    Live: "bg-emerald-500",
    Failed: "bg-red-500",
    Pending: "bg-amber-500",
    Escalated: "bg-amber-500",
    Verified: "bg-emerald-500",
    Unavailable: "bg-neutral-400",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-medium text-xs text-secondary-text", className)}>
      <span className="relative flex items-center justify-center">
        {(pulse || status === "Live" || status === "Syncing") && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              dotColor[status]
            )}
          />
        )}
        <span className={cn("rounded-full flex-shrink-0", dotSizes[size], dotColor[status])} />
      </span>
      {showText && <span>{status}</span>}
    </span>
  );
}
