"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "ai" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 font-medium select-none rounded border";

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[11px] leading-tight",
    md: "px-2 py-0.5 text-xs",
  };

  const variants = {
    neutral:
      "bg-secondary-surface text-secondary-text border-border",
    ai:
      "bg-secondary-surface text-primary-text border-border font-medium",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    error:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    outline:
      "bg-transparent text-secondary-text border-border",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      {...props}
    >
      {variant === "ai" && <span className="text-[10px] text-muted-text">✦</span>}
      {children}
    </span>
  );
}
