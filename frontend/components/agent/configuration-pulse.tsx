"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ConfigurationPulseProps {
  isActive: boolean;
  label?: string;
  className?: string;
}

export function ConfigurationPulse({
  isActive,
  label = "Knowledge Grounded",
  className,
}: ConfigurationPulseProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono transition-all duration-300",
        isActive
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "border-border bg-secondary-surface text-secondary-text",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-2 h-2">
        {isActive ? (
          <>
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </>
        ) : (
          <span className="inline-flex rounded-full h-1.5 w-1.5 bg-muted-text" />
        )}
      </div>

      <span className="transition-all duration-200">
        {isActive ? (
          <span className="inline-flex items-center gap-1 font-medium">
            <Check className="w-3 h-3" /> Updated
          </span>
        ) : (
          <span>{label}</span>
        )}
      </span>
    </div>
  );
}
