"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = "md",
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px] transition-opacity duration-200"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "relative w-full h-full bg-surface border-l border-border shadow-modal z-10 p-6 overflow-y-auto flex flex-col transition-transform duration-200 animate-in slide-in-from-right",
          widths[width],
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-border">
          <div>
            {title && <h3 className="text-base font-semibold text-primary-text">{title}</h3>}
            {description && (
              <p className="text-xs text-secondary-text mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary-text hover:text-primary-text rounded hover:bg-secondary-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
