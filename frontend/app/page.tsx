"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { apiRequest, AIEmployeeItem, MOCK_DIRECTORY_ITEMS } from "@/lib/api";
import {
  ArrowRight,
  ArrowDown,
} from "lucide-react";

const SLIDES = [
  { id: "hero", label: "Welcome" },
  { id: "about", label: "Philosophy" },
  { id: "workforce", label: "Workforce" },
  { id: "onboard", label: "Get Started" },
];

// Framer Motion 3D Stack Pinch-Out / Pinch-In Variants
const slideVariants = {
  past: {
    y: "-28px",
    scale: 0.88,
    opacity: 0.35,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  active: {
    y: "0%",
    scale: 1.0,
    opacity: 1.0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  future: {
    y: "100%",
    scale: 1.0,
    opacity: 1.0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HomePage() {
  const [featuredAIs, setFeaturedAIs] = useState<AIEmployeeItem[]>(MOCK_DIRECTORY_ITEMS.slice(0, 2));
  const [activeSection, setActiveSection] = useState(0);

  const activeSectionRef = useRef(0);
  activeSectionRef.current = activeSection;

  const isAnimatingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Fetch top 2 featured AI employees
  useEffect(() => {
    apiRequest<{ items: AIEmployeeItem[] }>("/directory?limit=2")
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setFeaturedAIs(res.items.slice(0, 2));
        }
      })
      .catch(() => {
        setFeaturedAIs(MOCK_DIRECTORY_ITEMS.slice(0, 2));
      });
  }, []);

  // Slide transition controller with cooldown lock
  const goToSlide = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= SLIDES.length) return;
    if (targetIndex === activeSectionRef.current) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    lastScrollTimeRef.current = Date.now();
    setActiveSection(targetIndex);

    // Sync URL hash without jumping
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${SLIDES[targetIndex].id}`);
    }

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 750);
  }, []);

  // Wheel gesture listener with inertia damping
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 750) return;
      if (isAnimatingRef.current) return;

      if (Math.abs(e.deltaY) < 25) return;

      if (e.deltaY > 0) {
        if (activeSectionRef.current < SLIDES.length - 1) {
          goToSlide(activeSectionRef.current + 1);
        }
      } else if (e.deltaY < 0) {
        if (activeSectionRef.current > 0) {
          goToSlide(activeSectionRef.current - 1);
        }
      }
    },
    [goToSlide]
  );

  // Touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    const now = Date.now();

    if (now - lastScrollTimeRef.current < 750) return;
    if (isAnimatingRef.current) return;

    if (Math.abs(deltaY) > 45) {
      if (deltaY > 0) {
        // Swiped up -> next slide
        if (activeSectionRef.current < SLIDES.length - 1) {
          goToSlide(activeSectionRef.current + 1);
        }
      } else {
        // Swiped down -> prev slide
        if (activeSectionRef.current > 0) {
          goToSlide(activeSectionRef.current - 1);
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const now = Date.now();
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        if (now - lastScrollTimeRef.current < 750) return;
        if (activeSectionRef.current < SLIDES.length - 1) {
          goToSlide(activeSectionRef.current + 1);
        }
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (now - lastScrollTimeRef.current < 750) return;
        if (activeSectionRef.current > 0) {
          goToSlide(activeSectionRef.current - 1);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(SLIDES.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToSlide]);

  // URL Hash synchronization
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      const foundIndex = SLIDES.findIndex((s) => s.id === hash);
      if (foundIndex !== -1 && foundIndex !== activeSectionRef.current) {
        goToSlide(foundIndex);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [goToSlide]);

  return (
    <div className="h-screen w-full bg-background text-primary-text flex flex-col overflow-hidden selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      {/* Top Navbar */}
      <Navbar />

      {/* Floating Side Dot Navigator */}
      <nav
        aria-label="Slide Navigation"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-center gap-3.5 bg-surface/70 backdrop-blur-md p-2 rounded-full border border-border/80 shadow-elevated transition-all"
      >
        {SLIDES.map((slide, idx) => {
          const isActive = activeSection === idx;
          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              title={slide.label}
              aria-label={`Go to ${slide.label}`}
              className="group relative flex items-center justify-center p-1 cursor-pointer"
            >
              <span
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-2.5 h-6 bg-primary-text shadow-subtle"
                    : "w-2 h-2 bg-muted-text/50 hover:bg-secondary-text hover:scale-125"
                }`}
              />
              {/* Tooltip on hover */}
              <span className="absolute right-7 px-2 py-1 rounded bg-surface border border-border text-[11px] font-medium text-primary-text opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-subtle">
                {slide.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 3D Stack Stage Container */}
      <div
        className="flex-1 w-full relative overflow-hidden"
        style={{ perspective: "1200px" }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* =========================================================================
            SLIDE 0: HERO / WELCOME (Screenshot 1)
        ========================================================================== */}
        <motion.section
          key="hero"
          id="hero"
          variants={slideVariants}
          initial={false}
          animate={activeSection === 0 ? "active" : "past"}
          style={{
            zIndex: 10,
            pointerEvents: activeSection === 0 ? "auto" : "none",
            transformOrigin: "center 40%",
          }}
          className="absolute inset-0 w-full h-full bg-background overflow-y-auto no-scrollbar flex flex-col items-center justify-center text-center px-6 sm:px-12"
        >
          <div className="max-w-3xl mx-auto space-y-6 my-auto">
            {/* Geometric AF Logo */}
            <div className="flex justify-center mb-1">
              <Logo size={56} showText={false} withLink={false} />
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AgentForge Platform • Autonomous Business Operations</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-primary-text leading-[1.12]">
              Welcome to AgentForge
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-secondary-text max-w-xl mx-auto leading-relaxed">
              Build, customize, and deploy your own AI employees for real-world business tasks.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/pricing">
                <Button size="lg" variant="primary" className="group">
                  <span>Onboard Your Own AI</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>

              <Link href="/directory">
                <Button size="lg" variant="secondary">
                  Explore Directory
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Scroll Down Indicator */}
          <button
            onClick={() => goToSlide(1)}
            aria-label="Scroll to About section"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs text-muted-text hover:text-primary-text transition-colors select-none group cursor-pointer"
          >
            <span className="text-[11px] font-medium">Scroll to explore</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-secondary-text group-hover:text-primary-text" />
          </button>
        </motion.section>

        {/* =========================================================================
            SLIDE 1: ABOUT AGENTFORGE / THE PHILOSOPHY (Screenshot 2)
        ========================================================================== */}
        <motion.section
          key="about"
          id="about"
          variants={slideVariants}
          initial={false}
          animate={activeSection === 1 ? "active" : activeSection > 1 ? "past" : "future"}
          style={{
            zIndex: 20,
            pointerEvents: activeSection === 1 ? "auto" : "none",
            transformOrigin: "center 40%",
          }}
          className="absolute inset-0 w-full h-full bg-background overflow-y-auto no-scrollbar flex flex-col items-center justify-center px-6 sm:px-12 shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.65)] border-t border-border/80"
        >
          <div className="max-w-5xl mx-auto w-full space-y-10 my-auto py-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                The AgentForge Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
                An Employee, Not Just An LLM
              </h2>
              <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                AgentForge empowers companies to deploy specialized autonomous staff trained on their
                exact operating policies, catalog, and customer service workflows.
              </p>
            </div>

            {/* 4 Workflow Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 space-y-3 flex flex-col justify-between hover:border-primary-text/30 transition-all duration-200">
                <div>
                  <div className="w-8 h-8 rounded bg-secondary-surface flex items-center justify-center text-primary-text mb-3 border border-border">
                    <span className="font-mono text-xs font-bold">01</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary-text">Define</h3>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                    Provide your website URL or business handbook. AgentForge auto-indexes policies and services.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-text">Vector RAG Ingestion</span>
              </Card>

              <Card className="p-5 space-y-3 flex flex-col justify-between hover:border-primary-text/30 transition-all duration-200">
                <div>
                  <div className="w-8 h-8 rounded bg-secondary-surface flex items-center justify-center text-primary-text mb-3 border border-border">
                    <span className="font-mono text-xs font-bold">02</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary-text">Interview</h3>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                    The AI asks structured questions to uncover operational gaps, refund rules, and brand tone.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-text">Gap Resolution</span>
              </Card>

              <Card className="p-5 space-y-3 flex flex-col justify-between hover:border-primary-text/30 transition-all duration-200">
                <div>
                  <div className="w-8 h-8 rounded bg-secondary-surface flex items-center justify-center text-primary-text mb-3 border border-border">
                    <span className="font-mono text-xs font-bold">03</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary-text">Build</h3>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                    AgentForge compiles deterministic safety guardrails, tool integrations, and operating hours.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-text">Business Brain Synthesis</span>
              </Card>

              <Card className="p-5 space-y-3 flex flex-col justify-between hover:border-primary-text/30 transition-all duration-200">
                <div>
                  <div className="w-8 h-8 rounded bg-secondary-surface flex items-center justify-center text-primary-text mb-3 border border-border">
                    <span className="font-mono text-xs font-bold">04</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary-text">Deploy</h3>
                  <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                    Launch on your website with one script tag or direct customers to your dedicated portal.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Live in 60s
                </span>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            SLIDE 2: REAL-WORLD DEMONSTRATIONS / WORKFORCE (Screenshot 3)
        ========================================================================== */}
        <motion.section
          key="workforce"
          id="workforce"
          variants={slideVariants}
          initial={false}
          animate={activeSection === 2 ? "active" : activeSection > 2 ? "past" : "future"}
          style={{
            zIndex: 30,
            pointerEvents: activeSection === 2 ? "auto" : "none",
            transformOrigin: "center 40%",
          }}
          className="absolute inset-0 w-full h-full bg-background overflow-y-auto no-scrollbar flex flex-col items-center justify-center px-6 sm:px-12 shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.65)] border-t border-border/80"
        >
          <div className="max-w-5xl mx-auto w-full space-y-8 my-auto py-8">
            {/* Header with View More link */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                  Real-World Demonstrations
                </span>
                <h2 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight mt-1">
                  Meet Your AI Workforce
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text mt-1 max-w-lg">
                  Explore active AI employees operating live customer support, booking consultations, and capturing leads.
                </p>
              </div>

              <Link href="/directory" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="group text-xs">
                  <span>View More AI Employees</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

            {/* 2 Live Featured Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredAIs.map((ai) => (
                <Card key={ai.id} hoverable className="p-6 flex flex-col justify-between border border-border">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Badge variant="outline" size="sm" className="mb-2">
                          {ai.category}
                        </Badge>
                        <h3 className="text-base font-semibold text-primary-text tracking-tight">
                          {ai.name}
                        </h3>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-secondary-text leading-relaxed mb-4">
                      {ai.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                      {ai.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary-surface text-secondary-text border border-border"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-text">slug: {ai.slug}</span>
                    <Link href={`/${ai.slug}`}>
                      <Button size="sm" variant="primary" className="group">
                        <span>Chat with AI</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bottom View More Link */}
            <div className="text-center pt-2">
              <Link href="/directory">
                <Button size="md" variant="secondary" className="group">
                  <span>View More AI Employees →</span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            SLIDE 3: ONBOARD SECTION & FULL-SCREEN FOOTER (Screenshot 4)
        ========================================================================== */}
        <motion.section
          key="onboard"
          id="onboard"
          variants={slideVariants}
          initial={false}
          animate={activeSection === 3 ? "active" : "future"}
          style={{
            zIndex: 40,
            pointerEvents: activeSection === 3 ? "auto" : "none",
            transformOrigin: "center 40%",
          }}
          className="absolute inset-0 w-full h-full bg-background overflow-y-auto no-scrollbar flex flex-col justify-between items-center px-6 sm:px-12 shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.65)] border-t border-border/80"
        >
          {/* Top spacer for optical centering */}
          <div className="w-full h-8" />

          {/* Centered CTA Block */}
          <div className="text-center max-w-2xl mx-auto space-y-4 my-auto">
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold text-primary-text tracking-tight">
              Onboard Your Own AI Employee
            </h2>
            <p className="text-sm text-secondary-text leading-relaxed max-w-lg mx-auto">
              Create an AI employee tailored to your business, workflow, and requirements in minutes.
            </p>
            <div className="pt-2">
              <Link href="/pricing">
                <Button size="lg" variant="primary" className="group shadow-elevated">
                  <span>Onboard Your Own AI</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Bottom Pinned Footer */}
          <footer className="w-full max-w-6xl mx-auto py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-text">
            <div className="flex items-center gap-3">
              <Logo size={20} showText={true} />
              <span className="text-muted-text">•</span>
              <span>© 2026 AgentForge, Inc. All rights reserved.</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-medium">
              <button
                onClick={() => goToSlide(1)}
                className="hover:text-primary-text transition-colors cursor-pointer"
              >
                About
              </button>
              <Link href="/directory" className="hover:text-primary-text transition-colors">
                Directory
              </Link>
              <Link href="/pricing" className="hover:text-primary-text transition-colors">
                Pricing
              </Link>
              <Link href="/privacy" className="hover:text-primary-text transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-text transition-colors">
                Terms of Service
              </Link>
              <a
                href="mailto:support@agentforge.ai"
                className="hover:text-primary-text transition-colors"
              >
                Contact
              </a>
            </div>
          </footer>
        </motion.section>
      </div>
    </div>
  );
}
