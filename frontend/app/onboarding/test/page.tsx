"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestConsole } from "@/components/agent/test-console";
import { ArrowRight, ArrowLeft, Bot, Sparkles, ShieldCheck } from "lucide-react";

export default function OnboardingTestPage() {
  const router = useRouter();

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
            <span>Step 06 • Interactive Sandbox</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Testing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
            Test Your AI Employee
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
            Verify real-time conversational responses, vector citations, and autonomous tool grounding before publishing to production.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="ai" size="sm">
            Zero-Hallucination Guardrails Active
          </Badge>
        </div>
      </div>

      {/* Spacious Test Console */}
      <div className="w-full bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-7">
        <TestConsole />
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/actions")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Actions</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/deploy")}
          className="group shadow-subtle cursor-pointer"
        >
          <span>Continue to Deploy</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
