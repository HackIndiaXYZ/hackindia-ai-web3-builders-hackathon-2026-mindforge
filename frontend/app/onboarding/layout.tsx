"use client";

import React from "react";
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar />
      <main className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-2xl bg-surface border border-border rounded-lg shadow-elevated p-8 sm:p-10 transition-all duration-200">
          {children}
        </div>
      </main>
    </div>
  );
}
