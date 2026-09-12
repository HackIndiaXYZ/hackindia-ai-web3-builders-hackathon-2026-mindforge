"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check active link
  const isActive = (path: string) => pathname === path;

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between transition-colors">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-primary-text text-background flex items-center justify-center font-bold text-xs tracking-tight">
            AF
          </div>
          <span className="font-semibold text-base tracking-tight text-primary-text">
            AgentForge
          </span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
        <Link
          href="/"
          className={`transition-colors ${
            isActive("/")
              ? "text-primary-text font-semibold"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          Home
        </Link>
        <Link
          href="/#about"
          className="text-secondary-text hover:text-primary-text transition-colors"
        >
          About
        </Link>
        <Link
          href="/directory"
          className={`transition-colors ${
            isActive("/directory")
              ? "text-primary-text font-semibold"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          AI Directory
        </Link>
        <Link
          href="/pricing"
          className={`transition-colors ${
            isActive("/pricing")
              ? "text-primary-text font-semibold"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          Pricing
        </Link>
      </nav>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
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

        {/* Authenticated vs Guest Actions */}
        {isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/onboarding">
              <Button size="sm" variant="primary">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Create AI
              </Button>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded text-secondary-text hover:text-rose-500 hover:bg-secondary-surface transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-medium text-secondary-text hover:text-primary-text px-3 py-1.5 rounded transition-colors"
            >
              Sign In
            </Link>
            <Link href="/pricing">
              <Button size="sm" variant="primary">
                Onboard Your AI
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded text-secondary-text hover:text-primary-text md:hidden"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface border-b border-border p-5 flex flex-col gap-4 md:hidden shadow-elevated z-50">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-primary-text"
          >
            Home
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            About
          </Link>
          <Link
            href="/directory"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            AI Directory
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Pricing
          </Link>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="primary" className="w-full">
                    Onboard New AI
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-rose-500 py-2 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="primary" className="w-full">
                    Onboard Your AI
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
