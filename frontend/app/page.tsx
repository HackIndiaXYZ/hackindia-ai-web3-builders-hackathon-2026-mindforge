"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiRequest, AIEmployeeItem, MOCK_DIRECTORY_ITEMS } from "@/lib/api";
import {
  ArrowRight,
  ArrowDown,
  Sparkles,
  Bot,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Activity,
  Zap,
  Terminal,
  ExternalLink,
} from "lucide-react";

// Staggered variants for opening sections smoothly
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
    },
  },
};

/**
 * ScrollSection wrapper with physical pinch-in / pinch-out scale effects on scroll
 */
function ScrollSection({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Pinch-out as it enters the viewport, open at full scale (1.0) when centered, pinch-in as it scrolls past
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.88, 1, 1, 1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.5, 0.82, 1], [0.35, 1, 1, 1, 0.35]);
  const y = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [36, 0, 0, 0, -36]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{
        scale,
        opacity,
        y,
        transformOrigin: "center center",
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const [featuredAIs, setFeaturedAIs] = useState<AIEmployeeItem[]>(MOCK_DIRECTORY_ITEMS.slice(0, 2));
  const [activeSection, setActiveSection] = useState<string>("hero");

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

  // Track active section for floating progress indicators
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "workforce", "onboard"];
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black relative overflow-x-hidden">
      <Navbar />

      {/* Floating Scroll Indicator with Pinch Cues */}
      <aside aria-label="Page section navigation" className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 p-2 rounded-full border border-border/80 bg-surface/85 backdrop-blur-md shadow-subtle">
        {[
          { id: "hero", label: "01 Hero" },
          { id: "about", label: "02 Workflow" },
          { id: "workforce", label: "03 Workforce" },
          { id: "onboard", label: "04 Launch" },
        ].map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className="group relative flex items-center justify-center w-7 h-7 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={sec.label}
              aria-label={`Scroll to ${sec.label}`}
            >
              <motion.span
                animate={{
                  scale: isActive ? 1.4 : 1,
                  backgroundColor: isActive ? "var(--primary-text)" : "var(--border)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-2 h-2 rounded-full block"
              />
              <span className="absolute right-9 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap bg-surface border border-border shadow-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-secondary-text">
                {sec.label}
              </span>
            </button>
          );
        })}
      </aside>

      <main className="flex-1 flex flex-col">
        {/* =========================================================================
            SECTION 1: HERO / WELCOME (Interactive Pinch Opening & Live Preview)
        ========================================================================== */}
        <ScrollSection
          id="hero"
          className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 sm:px-12 relative border-b border-border/80 py-16"
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-6 w-full"
          >
            {/* Live Indicator Pill */}
            <motion.div variants={itemVariants} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text shadow-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px]">AgentForge Platform • Autonomous Business Operations</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-semibold tracking-tight text-primary-text leading-[1.12]"
            >
              Welcome to AgentForge
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-secondary-text max-w-2xl mx-auto leading-relaxed"
            >
              Build, customize, and deploy your own AI employees for real-world business tasks.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/pricing">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="primary" className="group shadow-subtle">
                    <span>Onboard Your Own AI</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/directory">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="secondary" className="shadow-subtle">
                    Explore Directory
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Interactive Tactile Hero Preview Card (Pinch in/out response) */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="pt-6 max-w-2xl mx-auto w-full text-left"
            >
              <div className="rounded-xl border border-border bg-surface/90 shadow-elevated overflow-hidden backdrop-blur-sm">
                {/* Window Header */}
                <div className="px-4 py-2.5 border-b border-border bg-secondary-surface/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-muted-text font-mono text-[11px] ml-2 flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-secondary-text" />
                      agentforge-runtime // live-demo
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    online
                  </span>
                </div>

                {/* Simulated Conversation & Execution Flow */}
                <div className="p-4 sm:p-5 space-y-3 font-mono text-xs">
                  <div className="flex items-start gap-2.5 text-secondary-text">
                    <span className="text-muted-text font-bold select-none">&gt;</span>
                    <p className="text-primary-text font-sans text-xs sm:text-sm">
                      <span className="text-muted-text font-mono text-xs mr-1">[Customer]</span>
                      Can I reschedule my appointment to Thursday at 3 PM and confirm pricing?
                    </p>
                  </div>

                  <div className="pl-4 py-1.5 border-l-2 border-accent/40 space-y-1 text-[11px] text-muted-text font-mono bg-secondary-surface/30 rounded-r">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Vector match: &quot;Appointment Booking &amp; Reschedule Policy&quot; (similarity: 0.96)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-secondary-text" />
                      <span>Tool executed: check_calendar_slot(doctor=&quot;Dr. Patel&quot;, time=&quot;Thu 15:00&quot;)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-primary-text pt-1">
                    <span className="text-emerald-500 font-bold select-none">AI:</span>
                    <p className="font-sans text-xs sm:text-sm leading-relaxed text-secondary-text">
                      <span className="text-primary-text font-medium">Dr. Patel has Thursday at 3:00 PM open!</span>{" "}
                      I&apos;ve reserved the slot and sent a confirmation invite to your email. The standard consultation fee is $120.
                    </p>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-2 border-t border-border/60 bg-secondary-surface/40 flex items-center justify-between text-[11px] font-mono text-muted-text">
                  <span>Latency: 184ms • Model: Llama-3.3-70b-versatile</span>
                  <span className="text-primary-text font-medium flex items-center gap-1">
                    <span>Autonomous Guardrails Active</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Guidance Indicator */}
          <div className="mt-12 flex flex-col items-center gap-1.5 text-xs text-muted-text select-none">
            <span className="font-mono text-[11px]">Scroll to open workflow</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </ScrollSection>

        {/* =========================================================================
            SECTION 2: ABOUT AGENTFORGE (Define -> Interview -> Build -> Deploy)
        ========================================================================== */}
        <ScrollSection id="about" className="py-24 px-6 sm:px-12 max-w-5xl mx-auto w-full border-b border-border/80">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={containerVariants}
            className="space-y-12"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-3">
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
            </motion.div>

            {/* 4-Step Interactive Workflow Cards with Pinch-on-Hover */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  step: "01",
                  title: "Define",
                  desc: "Provide your website URL or business handbook. AgentForge auto-indexes policies and services.",
                  badge: "Vector RAG Ingestion",
                },
                {
                  step: "02",
                  title: "Interview",
                  desc: "The AI asks structured questions to uncover operational gaps, refund rules, and brand tone.",
                  badge: "Gap Resolution",
                },
                {
                  step: "03",
                  title: "Build",
                  desc: "AgentForge compiles deterministic safety guardrails, tool integrations, and operating hours.",
                  badge: "Brain Synthesis",
                },
                {
                  step: "04",
                  title: "Deploy",
                  desc: "Launch on your website with one script tag or direct customers to your dedicated portal.",
                  badge: "Live in 60s",
                  highlight: true,
                },
              ].map((card) => (
                <motion.div
                  key={card.step}
                  variants={itemVariants}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="flex flex-col h-full"
                >
                  <Card className="p-5 space-y-3 flex flex-col justify-between h-full border-border hover:border-accent transition-colors shadow-subtle">
                    <div>
                      <div className="w-8 h-8 rounded bg-secondary-surface flex items-center justify-center text-primary-text mb-3 border border-border font-mono text-xs font-bold">
                        {card.step}
                      </div>
                      <h3 className="text-sm font-semibold text-primary-text">{card.title}</h3>
                      <p className="text-xs text-secondary-text mt-1.5 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-mono pt-3 border-t border-border/50 ${
                        card.highlight
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-text"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </ScrollSection>

        {/* =========================================================================
            SECTION 3: AI EMPLOYEE SHOWCASE (Top 2 Featured Cards + View More)
        ========================================================================== */}
        <ScrollSection id="workforce" className="py-24 px-6 sm:px-12 max-w-5xl mx-auto w-full border-b border-border/80">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={containerVariants}
            className="space-y-10"
          >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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

              <Link href="/directory">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" size="sm" className="group text-xs">
                    <span>View More AI Employees</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* 2 Featured AI Cards with Staggered Pinch-Opening */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredAIs.map((ai) => (
                <motion.div
                  key={ai.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="flex flex-col h-full"
                >
                  <Card hoverable className="p-6 flex flex-col justify-between h-full shadow-subtle border-border hover:border-accent">
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

                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                </motion.div>
              ))}
            </motion.div>

            {/* Explicit View More CTA */}
            <motion.div variants={itemVariants} className="pt-4 text-center">
              <Link href="/directory">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Button size="md" variant="secondary" className="group shadow-subtle">
                    <span>View More AI Employees →</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </ScrollSection>

        {/* =========================================================================
            SECTION 4: ONBOARD SECTION & FOOTER (Cinematic Card Pinch Opening)
        ========================================================================== */}
        <ScrollSection id="onboard" className="py-24 px-6 sm:px-12 text-center max-w-3xl mx-auto w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={containerVariants}
            className="rounded-2xl border border-border bg-surface p-8 sm:p-12 shadow-elevated space-y-6 relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

            <motion.div variants={itemVariants} className="space-y-3 relative z-10">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                Get Started
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
                Onboard Your Own AI Employee
              </h2>
              <p className="text-sm text-secondary-text leading-relaxed max-w-lg mx-auto">
                Create an AI employee tailored to your business, workflow, and requirements in minutes.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2 relative z-10">
              <Link href="/pricing">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                  <Button size="lg" variant="primary" className="group shadow-subtle">
                    <span>Onboard Your Own AI</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Feature guarantees */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-muted-text relative z-10"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                No Code Required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Deterministic Guardrails
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                Ready in 60s
              </span>
            </motion.div>
          </motion.div>
        </ScrollSection>
      </main>

      {/* Footer per PRD Section 4 */}
      <footer className="border-t border-border py-10 px-6 sm:px-12 bg-surface text-xs text-secondary-text">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary-text">AgentForge</span>
            <span className="text-muted-text">•</span>
            <span>© 2026 AgentForge, Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <Link href="/#about" className="hover:text-primary-text transition-colors">
              About
            </Link>
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
            <a href="mailto:support@agentforge.ai" className="hover:text-primary-text transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
