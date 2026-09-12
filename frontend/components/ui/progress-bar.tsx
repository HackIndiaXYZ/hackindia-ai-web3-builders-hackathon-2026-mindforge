"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  animated?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  animated = false,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = {
    sm: "h-1",
    md: "h-1.5",
  };

  return (
    <div
      className={cn(
        "w-full bg-secondary-surface border border-border/40 rounded-full overflow-hidden relative",
        heights[size],
        className
      )}
    >
      <div
        className={cn(
          "h-full bg-primary-text transition-all duration-300 ease-out rounded-full",
          animated && "relative overflow-hidden"
        )}
        style={{ width: `${percentage}%` }}
      >
        {animated && (
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        )}
      </div>
    </div>
  );
}
