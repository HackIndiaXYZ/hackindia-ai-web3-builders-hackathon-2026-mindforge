"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-provider";
import { useAgentForge } from "@/lib/mock-data";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Sun, Moon, Search, ArrowLeft } from "lucide-react";
import { ConfigurationPulse } from "@/components/agent/configuration-pulse";

interface TopHeaderProps {
  onOpenCommandMenu: () => void;
}

export function TopHeader({ onOpenCommandMenu }: TopHeaderProps) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { agent, isPulseActive } = useAgentForge();

  // Extract human-readable breadcrumb label from route
  const getRouteLabel = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Overview";
    const sub = parts[1];
    return sub
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left breadcrumb & agent status */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-muted-text hover:text-primary-text transition-colors p-1 -ml-1 rounded"
          title="Back to Overview"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary-text">Workspace</span>
          <span className="text-border">/</span>
          <span className="text-primary-text font-medium">{agent.name}</span>
          <span className="text-border">/</span>
          <span className="text-muted-text">{getRouteLabel()}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-border">
          <StatusIndicator status={agent.status} showText />
          <ConfigurationPulse isActive={isPulseActive} />
        </div>
      </div>

      {/* Right actions: Search ⌘K, Theme, Avatar */}
      <div className="flex items-center gap-3">
        {/* Command Menu Button */}
        <button
          onClick={onOpenCommandMenu}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-border bg-secondary-surface/60 text-secondary-text hover:text-primary-text hover:border-muted-text/50 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.2 rounded border border-border bg-surface text-[10px] font-mono text-muted-text">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded text-secondary-text hover:text-primary-text hover:bg-secondary-surface transition-colors"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-200 rotate-0 hover:-rotate-12" />
          )}
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-secondary-surface border border-border flex items-center justify-center text-xs font-medium text-primary-text">
          SA
        </div>
      </div>
    </header>
  );
}
