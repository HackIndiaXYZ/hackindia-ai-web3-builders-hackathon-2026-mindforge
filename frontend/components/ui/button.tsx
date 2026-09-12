"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none rounded active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary-text text-background hover:opacity-90 active:opacity-95 shadow-subtle",
      secondary:
        "bg-secondary-surface text-primary-text hover:bg-border/60 active:bg-border border border-border",
      outline:
        "border border-border bg-transparent text-primary-text hover:bg-secondary-surface active:bg-secondary-surface",
      ghost:
        "bg-transparent text-secondary-text hover:text-primary-text hover:bg-secondary-surface",
      danger:
        "bg-semantic-error text-white hover:opacity-90 active:opacity-95",
    };

    const sizes = {
      sm: "h-7 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
