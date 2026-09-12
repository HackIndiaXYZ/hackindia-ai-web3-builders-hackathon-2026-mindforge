"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-provider";
import { useAgentForge } from "@/lib/mock-data";
import {
  Search,
  LayoutDashboard,
  Brain,
  Database,
  MessageSquare,
  BarChart3,
  Plus,
  Bot,
  Send,
  Sun,
  Moon,
  X,
} from "lucide-react";

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddSource?: () => void;
}

export function CommandMenu({ isOpen, onClose, onOpenAddSource }: CommandMenuProps) {
  const router = useRouter();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { deployAgent } = useAgentForge();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // open command menu trigger handled by parent or custom event
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const items = [
    {
      group: "Navigation",
      list: [
        { label: "Go to Dashboard", icon: LayoutDashboard, action: () => navigateTo("/dashboard") },
        { label: "Go to Business Brain", icon: Brain, action: () => navigateTo("/dashboard/business-brain") },
        { label: "Go to Knowledge", icon: Database, action: () => navigateTo("/dashboard/knowledge") },
        { label: "Go to Conversations", icon: MessageSquare, action: () => navigateTo("/dashboard/conversations") },
        { label: "Go to Analytics", icon: BarChart3, action: () => navigateTo("/dashboard/analytics") },
      ],
    },
    {
      group: "Quick Actions",
      list: [
        {
          label: "Create knowledge source",
          icon: Plus,
          action: () => {
            onClose();
            if (onOpenAddSource) onOpenAddSource();
            else router.push("/dashboard/knowledge");
          },
        },
        { label: "Test agent", icon: Bot, action: () => navigateTo("/dashboard/test") },
        {
          label: "Deploy agent",
          icon: Send,
          action: () => {
            deployAgent();
            navigateTo("/dashboard/deploy");
          },
        },
        {
          label: `Toggle theme (Current: ${resolvedTheme})`,
          icon: resolvedTheme === "dark" ? Sun : Moon,
          action: () => {
            toggleTheme();
            onClose();
          },
        },
      ],
    },
  ];

  const filteredItems = items.map((section) => ({
    ...section,
    list: section.list.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((section) => section.list.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/75 backdrop-blur-[2px] transition-opacity"
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-xl bg-surface border border-border rounded shadow-modal z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-text mr-2" />
          <input
            autoFocus
            type="text"
            placeholder="Search AgentForge commands, pages, sources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-transparent text-sm text-primary-text placeholder:text-muted-text focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-text hover:text-primary-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-text">
              No matching commands or navigation links found.
            </div>
          ) : (
            filteredItems.map((section) => (
              <div key={section.group} className="mb-2">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-text uppercase tracking-wider">
                  {section.group}
                </div>
                <div className="space-y-0.5">
                  {section.list.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-secondary-text hover:text-primary-text hover:bg-secondary-surface transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-secondary-text" />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-secondary-surface/40 flex items-center justify-between text-[11px] text-muted-text font-mono">
          <span>Navigate with ↵ or click</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
