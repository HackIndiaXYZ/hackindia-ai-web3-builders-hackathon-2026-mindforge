"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't sync this source. Your existing knowledge is still safe.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "p-4 rounded border border-border bg-surface flex items-start gap-3 text-left max-w-lg",
        className
      )}
    >
      <div className="p-1 rounded bg-secondary-surface text-secondary-text mt-0.5">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
      </div>
      <div className="flex-1 space-y-1">
        <h5 className="text-xs font-semibold text-primary-text">{title}</h5>
        <p className="text-xs text-secondary-text leading-normal">{message}</p>
        {onRetry && (
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
