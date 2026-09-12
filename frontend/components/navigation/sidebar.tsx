"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Brain,
  Database,
  FileCode2,
  Send,
  MessageSquare,
  BarChart3,
  Fingerprint,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Business Brain", href: "/dashboard/business-brain", icon: Brain },
    { label: "Knowledge", href: "/dashboard/knowledge", icon: Database },
    { label: "Instructions", href: "/dashboard/instructions", icon: FileCode2 },
    { label: "Deploy", href: "/dashboard/deploy", icon: Send },
    { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const secondaryNav = [
    { label: "Identity", href: "/dashboard/identity", icon: Fingerprint },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const renderItem = (item: { label: string; href: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors relative select-none",
          isActive
            ? "text-primary-text bg-secondary-surface"
            : "text-secondary-text hover:text-primary-text hover:bg-secondary-surface/60"
        )}
      >
        {/* Subtle active left border accent */}
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary-text rounded-r" />
        )}
        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary-text" : "text-secondary-text group-hover:text-primary-text")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ease-in-out z-20 select-none",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div>
        {/* Brand header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <Logo size={26} showText={!collapsed} subtitle="Enterprise" />

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded text-secondary-text hover:text-primary-text hover:bg-secondary-surface transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-6 overflow-y-auto">
          {/* Main workspace section */}
          <div>
            {!collapsed && (
              <div className="px-3 pb-2 text-[11px] font-semibold text-muted-text uppercase tracking-wider">
                Workspace
              </div>
            )}
            <nav className="space-y-1">{mainNav.map(renderItem)}</nav>
          </div>

          <div className="border-t border-border/80 pt-4">
            {!collapsed && (
              <div className="px-3 pb-2 text-[11px] font-semibold text-muted-text uppercase tracking-wider">
                System
              </div>
            )}
            <nav className="space-y-1">{secondaryNav.map(renderItem)}</nav>
          </div>
        </div>
      </div>

      {/* User / Org Footer */}
      <div className="p-3 border-t border-border">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded hover:bg-secondary-surface transition-colors cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-secondary-surface border border-border flex items-center justify-center text-xs font-medium text-primary-text flex-shrink-0">
            AC
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary-text truncate">Acme Technologies</p>
              <p className="text-[11px] text-muted-text truncate font-mono">admin@acme.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
