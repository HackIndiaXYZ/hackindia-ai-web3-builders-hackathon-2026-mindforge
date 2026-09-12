"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentForge } from "@/lib/mock-data";
import { ArrowRight, ArrowLeft, Check, CheckSquare, Square } from "lucide-react";

interface QuestionStep {
  id: string;
  question: string;
  description?: string;
  instructionHint: string;
  options: string[];
}

const QUESTIONS: QuestionStep[] = [
  {
    id: "purpose",
    question: "What should your agent help customers with most often?",
    description: "Determines the priority grounding weights and tool invocation rules.",
    instructionHint: "Choose one, multiple, or all operational scopes.",
    options: [
      "Customer support and product questions",
      "Sales qualification & demo scheduling",
      "Billing & operational account inquiries",
      "Technical API troubleshooting",
    ],
  },
  {
    id: "escalation",
    question: "When should the agent escalate to a human team member?",
    description: "Defines autonomous boundary rules for employee handoff.",
    instructionHint: "Select all policies that require human review.",
    options: [
      "Refund requests over $250 or angry sentiment",
      "Any issue requiring database mutation or refunds",
      "Only when confidence falls below 85%",
      "Always attempt resolution before offering human transfer",
    ],
  },
  {
    id: "tone",
    question: "What demeanor should your agent embody?",
    description: "Applied as deterministic tone guardrails.",
    instructionHint: "Select the tone traits that represent your brand.",
    options: [
      "Professional, concise, and technical",
      "Friendly, consultative, and empathetic",
      "Direct, brief, and action-driven",
    ],
  },
];

export default function OnboardingInterviewPage() {
  const router = useRouter();
  const { updateBrain, updateInstructions } = useAgentForge();

  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Multi-select state: array of selected options per question
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({
    purpose: ["Customer support and product questions"],
    escalation: ["Refund requests over $250 or angry sentiment"],
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
        // Allow removing, but keep at least 1 item
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
      // Sync all selections to business brain and instructions
      const purposeList = selectedAnswers["purpose"] || [];
      const escalationList = selectedAnswers["escalation"] || [];
      const toneList = selectedAnswers["tone"] || [];

      // Extract tone traits
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-text uppercase tracking-wider">
            <span>
              Question {currentQIndex + 1} of {QUESTIONS.length}
            </span>
            <span>•</span>
            <span>Structured Interview</span>
          </div>

          <span className="text-[11px] font-mono text-secondary-text">
            {activeSelections.length} of {currentQ.options.length} selected
          </span>
        </div>

        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          Configure your agent
        </h2>
        <p className="text-xs text-secondary-text mt-1">{currentQ.question}</p>
        <p className="text-[11px] text-muted-text mt-0.5">{currentQ.instructionHint}</p>
      </div>

      {/* Select All / Choose All Action Bar */}
      <div className="flex items-center justify-between pt-1 pb-1 border-b border-border/60">
        <span className="text-xs text-secondary-text font-medium">Available scopes</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-secondary-text hover:text-primary-text font-mono transition-colors inline-flex items-center gap-1.5 py-1 px-2 rounded hover:bg-secondary-surface"
        >
          {isAllSelected ? (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-primary-text" />
              <span>Deselect all</span>
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5 text-muted-text" />
              <span>Choose all options</span>
            </>
          )}
        </button>
      </div>

      {/* Multi-Select Options List */}
      <div className="space-y-2.5 pt-1">
        {currentQ.options.map((opt) => {
          const active = isSelected(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`w-full flex items-center justify-between p-3.5 rounded border text-left text-xs transition-all select-none group ${
                active
                  ? "border-primary-text bg-secondary-surface text-primary-text font-medium shadow-subtle"
                  : "border-border bg-surface text-secondary-text hover:border-muted-text hover:bg-secondary-surface/40"
              }`}
            >
              <span className="pr-4">{opt}</span>

              {/* Tactile Checkbox Box */}
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  active
                    ? "border-primary-text bg-primary-text text-background"
                    : "border-border bg-surface group-hover:border-muted-text"
                }`}
              >
                {active && <Check className="w-3 h-3 stroke-[2.5]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation footer */}
      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button variant="ghost" size="md" onClick={handlePrev}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button variant="primary" size="lg" onClick={handleNext} className="group">
          <span>
            {currentQIndex === QUESTIONS.length - 1 ? "Synthesize Brain" : "Continue"}
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
