"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentForge } from "@/lib/mock-data";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Shield,
  HelpCircle,
} from "lucide-react";

interface QuestionStep {
  id: "purpose" | "escalation" | "tone";
  pillLabel: string;
  question: string;
  description: string;
  instructionHint: string;
  options: string[];
}

const QUESTIONS: QuestionStep[] = [
  {
    id: "purpose",
    pillLabel: "01 Operational Scopes",
    question: "What should your AI employee assist customers with most often?",
    description: "Configures priority knowledge grounding, vector similarity weights, and autonomous tools.",
    instructionHint: "Choose one, multiple, or all operational scopes that apply to your business.",
    options: [
      "Customer support and product catalog questions",
      "Sales lead qualification & demo consultation booking",
      "Billing, payment inquiries, and invoice questions",
      "Technical troubleshooting & service onboarding guides",
    ],
  },
  {
    id: "escalation",
    pillLabel: "02 Escalation Boundaries",
    question: "When should the agent escalate directly to a human team member?",
    description: "Defines deterministic safety guardrails for employee handoff and email notifications.",
    instructionHint: "Select all policies and conditions that require mandatory human review.",
    options: [
      "Refund disputes over $250 or angry customer sentiment",
      "Any request requiring direct database mutation or cancellation",
      "When knowledge confidence score falls below 80%",
      "Always attempt resolution before offering human transfer",
    ],
  },
  {
    id: "tone",
    pillLabel: "03 Brand Tone & Demeanor",
    question: "What demeanor and voice should your agent embody?",
    description: "Applied as system prompt constraints across all customer conversations.",
    instructionHint: "Select the tone traits that best represent your company culture.",
    options: [
      "Professional, concise, and technical",
      "Friendly, consultative, and empathetic",
      "Direct, brief, and action-driven",
      "Formal, diplomatic, and enterprise-grade",
    ],
  },
];

export default function OnboardingInterviewPage() {
  const router = useRouter();
  const { updateBrain, updateInstructions } = useAgentForge();

  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Multi-select state: array of selected options per question
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({
    purpose: ["Customer support and product catalog questions"],
    escalation: ["Refund disputes over $250 or angry customer sentiment"],
    tone: ["Professional, concise, and technical"],
  });

  const currentQ = QUESTIONS[currentQIndex];
  const activeSelections = selectedAnswers[currentQ.id] || [];

  const isSelected = (opt: string) => activeSelections.includes(opt);
  const isAllSelected = activeSelections.length === currentQ.options.length;

  const toggleOption = (opt: string) => {
    setSelectedAnswers((prev) => {
      const currentList = prev[currentQ.id] || [];
      if (currentList.includes(opt)) {
        if (currentList.length === 1) return prev;
        return {
          ...prev,
          [currentQ.id]: currentList.filter((item) => item !== opt),
        };
      } else {
        return {
          ...prev,
          [currentQ.id]: [...currentList, opt],
        };
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: isAllSelected ? [currentQ.options[0]] : [...currentQ.options],
    }));
  };

  const handleNext = () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      const purposeList = selectedAnswers["purpose"] || [];
      const escalationList = selectedAnswers["escalation"] || [];
      const toneList = selectedAnswers["tone"] || [];

      const extractedTraits = toneList
        .flatMap((t) => t.split(","))
        .map((t) => t.trim().replace("and ", ""))
        .filter(Boolean);

      updateBrain({
        tone: {
          traits: extractedTraits.length > 0 ? extractedTraits : ["Professional", "Helpful"],
          summary: `Configured to balance: ${toneList.join("; ")}`,
        },
      });

      const newRules = [
        "Don't invent information",
        "Ask for clarification when needed",
        ...escalationList.map((e) => `Escalation policy: ${e}`),
      ];

      updateInstructions(
        newRules,
        `You are the representative for Acme handling ${purposeList.join(", ")}.`
      );

      router.push("/onboarding/brain");
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    } else {
      router.push("/onboarding/sources");
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header & Step Pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {QUESTIONS.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                idx === currentQIndex
                  ? "bg-primary-text text-background font-semibold shadow-subtle"
                  : idx < currentQIndex
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-secondary-surface text-secondary-text border border-border"
              }`}
            >
              {q.pillLabel}
            </button>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
          {currentQ.question}
        </h1>
        <p className="text-xs sm:text-sm text-secondary-text max-w-2xl leading-relaxed">
          {currentQ.description}
        </p>
      </div>

      {/* Spacious 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Options Grid */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-medium text-secondary-text">
              {currentQ.instructionHint}
            </span>

            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-secondary-text hover:text-primary-text font-mono transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-secondary-surface cursor-pointer"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-primary-text" />
                  <span>Deselect all</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-muted-text" />
                  <span>Select all</span>
                </>
              )}
            </button>
          </div>

          {/* 2-Column Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt) => {
              const active = isSelected(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={`p-5 rounded-xl border text-left text-xs transition-all select-none cursor-pointer flex flex-col justify-between gap-4 ${
                    active
                      ? "border-primary-text bg-secondary-surface text-primary-text font-medium shadow-subtle ring-1 ring-primary-text/20"
                      : "border-border bg-surface text-secondary-text hover:border-muted-text hover:bg-secondary-surface/40"
                  }`}
                >
                  <span className="leading-relaxed text-xs">{opt}</span>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[11px] font-mono text-muted-text">
                      {active ? "Active Rule" : "Optional"}
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        active
                          ? "border-primary-text bg-primary-text text-background"
                          : "border-border bg-surface"
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Guardrail Synthesis Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-surface shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                Live Guardrail Draft
              </span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-secondary-surface/60 border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-secondary-text uppercase font-mono block">
                  Configured Scopes:
                </span>
                <p className="text-primary-text font-medium leading-relaxed">
                  {selectedAnswers["purpose"]?.join(", ") || "Support"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-secondary-surface/60 border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-secondary-text uppercase font-mono block">
                  Escalation Triggers:
                </span>
                <p className="text-primary-text font-medium leading-relaxed">
                  {selectedAnswers["escalation"]?.join("; ") || "Standard transfer"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-secondary-surface/60 border border-border space-y-1.5">
                <span className="text-[11px] font-semibold text-secondary-text uppercase font-mono block">
                  Tone Profile:
                </span>
                <p className="text-primary-text font-medium leading-relaxed">
                  {selectedAnswers["tone"]?.join(", ") || "Professional"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button variant="ghost" size="md" onClick={handlePrev} className="cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          className="group shadow-subtle cursor-pointer"
        >
          <span>
            {currentQIndex === QUESTIONS.length - 1 ? "Synthesize Business Brain" : "Next Question"}
          </span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
