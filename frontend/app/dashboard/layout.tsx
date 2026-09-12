"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopHeader } from "@/components/navigation/top-header";
import { CommandMenu } from "@/components/navigation/command-menu";
import { AddSourceModal } from "@/components/knowledge/add-source-modal";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Brain,
  Bot,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [addSourceOpen, setAddSourceOpen] = useState(false);

  // Load sidebar collapsed state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agentforge_sidebar_collapsed");
      if (stored !== null) {
        setSidebarCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("agentforge_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut listener for Command Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const mobileNavItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Brain", href: "/dashboard/business-brain", icon: Brain },
    { label: "Test", href: "/dashboard/test", icon: Bot },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-primary-text flex">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative w-64 bg-surface h-full z-10 p-4 flex flex-col justify-between border-r border-border">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <Logo size={24} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-secondary-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Overview
                </Link>
                <Link
                  href="/dashboard/business-brain"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Business Brain
                </Link>
                <Link
                  href="/dashboard/knowledge"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Knowledge Sources
                </Link>
                <Link
                  href="/dashboard/instructions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Instructions
                </Link>
                <Link
                  href="/dashboard/actions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Actions
                </Link>
                <Link
                  href="/dashboard/test"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Test Console
                </Link>
                <Link
                  href="/dashboard/conversations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Conversations
                </Link>
                <Link
                  href="/dashboard/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard/deploy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-medium rounded hover:bg-secondary-surface"
                >
                  Deploy
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Top Bar */}
        <div className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 text-secondary-text hover:text-primary-text"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo size={22} />
          </div>
          <button
            onClick={() => setCommandMenuOpen(true)}
            className="text-xs px-2 py-1 rounded border border-border text-secondary-text"
          >
            ⌘K
          </button>
        </div>

        {/* Desktop Top Header */}
        <div className="hidden md:block">
          <TopHeader onOpenCommandMenu={() => setCommandMenuOpen(true)} />
        </div>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (PRD Section 38: Home Brain Test Settings) */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 h-14 bg-surface border-t border-border flex items-center justify-around md:hidden z-30 px-2"
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary-text font-semibold" : "text-secondary-text hover:text-primary-text"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ⌘K Command Palette */}
      <CommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
        onOpenAddSource={() => setAddSourceOpen(true)}
      />

      {/* Global Add Source Modal */}
      <AddSourceModal
        isOpen={addSourceOpen}
        onClose={() => setAddSourceOpen(false)}
      />
    </div>
  );
}
