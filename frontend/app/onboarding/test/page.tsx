"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TestConsole } from "@/components/agent/test-console";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingTestPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          Test Agent Console
        </h2>
        <p className="text-xs text-secondary-text mt-1">
          Verify responses in real-time. Notice the "Why this answer?" panel verifying grounding sources.
        </p>
      </div>

      <div className="pt-2">
        <TestConsole />
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/actions")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/deploy")}
          className="group"
        >
          <span>Continue to Deploy</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
