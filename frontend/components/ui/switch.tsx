"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  label?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className,
  label,
}: SwitchProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "w-8 h-4.5 p-0.5 rounded-full transition-colors duration-150 relative inline-flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-text disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-primary-text" : "bg-border"
        )}
      >
        <span
          className={cn(
            "w-3.5 h-3.5 rounded-full bg-surface shadow-subtle transition-transform duration-150 inline-block pointer-events-none",
            checked ? "translate-x-3.5" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <span
          onClick={() => !disabled && onCheckedChange(!checked)}
          className="text-xs font-medium text-secondary-text cursor-pointer select-none"
        >
          {label}
        </span>
      )}
    </div>
  );
}
