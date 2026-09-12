"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  detail?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  detail,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-surface border border-border rounded p-4 flex flex-col justify-between", className)}>
      <span className="text-xs font-medium text-secondary-text tracking-normal">{label}</span>
      <div className="my-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-primary-text tracking-tight">{value}</span>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
              changeType === "negative" && "text-rose-600 dark:text-rose-400",
              changeType === "neutral" && "text-secondary-text"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {detail && <p className="text-[11px] text-muted-text">{detail}</p>}
    </div>
  );
}
