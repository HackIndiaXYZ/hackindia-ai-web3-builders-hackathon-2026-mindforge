"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const ONBOARDING_STEPS = [
  { id: "business", number: "01", label: "Business", href: "/onboarding/business" },
  { id: "sources", number: "02", label: "Sources", href: "/onboarding/sources" },
  { id: "interview", number: "03", label: "Interview", href: "/onboarding/interview" },
  { id: "brain", number: "04", label: "Business Brain", href: "/onboarding/brain" },
  { id: "actions", number: "05", label: "Actions", href: "/onboarding/actions" },
  { id: "test", number: "06", label: "Test", href: "/onboarding/test" },
  { id: "deploy", number: "07", label: "Deploy", href: "/onboarding/deploy" },
];

export function OnboardingProgressBar() {
  const pathname = usePathname();

  const currentStepIndex = ONBOARDING_STEPS.findIndex((step) => pathname.includes(step.id));
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="w-full bg-surface border-b border-border py-4 px-6 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={22} showText={true} />
          <span className="text-muted-text text-xs">/</span>
          <span className="text-xs text-secondary-text">Configure Employee</span>
        </div>

        <nav aria-label="Onboarding Progress" className="flex items-center gap-1 sm:gap-3">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <React.Fragment key={step.id}>
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded text-xs transition-colors select-none",
                    isCurrent && "font-medium text-primary-text bg-secondary-surface",
                    isCompleted && "text-secondary-text hover:text-primary-text",
                    !isCurrent && !isCompleted && "text-muted-text hover:text-secondary-text"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono",
                      isCompleted && "bg-emerald-500 text-white",
                      isCurrent && "border border-primary-text text-primary-text",
                      !isCurrent && !isCompleted && "border border-border text-muted-text"
                    )}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : step.number}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </Link>

                {index < ONBOARDING_STEPS.length - 1 && (
                  <span className="text-border text-xs select-none">/</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="text-xs font-mono text-muted-text">
          Step {activeIndex + 1} of {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}
