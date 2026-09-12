"use client";

import React from "react";
import { OnboardingProgressBar } from "@/components/onboarding/progress-bar";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      <OnboardingProgressBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 sm:py-10 flex flex-col">
        {children}
      </main>
    </div>
  );
}
