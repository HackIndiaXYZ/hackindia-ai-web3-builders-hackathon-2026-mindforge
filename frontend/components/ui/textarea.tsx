"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-secondary-text">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full min-h-[90px] p-3 rounded bg-surface border border-border text-primary-text text-sm placeholder:text-muted-text/70 transition-all duration-150 focus:outline-none focus:border-primary-text focus:ring-1 focus:ring-primary-text/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        {!error && hint && <p className="text-xs text-muted-text">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
