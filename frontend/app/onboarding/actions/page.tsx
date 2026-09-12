"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ActionConfirmModal } from "@/components/agent/action-confirm-modal";
import { useAgentForge, AgentAction } from "@/lib/mock-data";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Lock,
  Sliders,
  Instagram,
  Facebook,
  Database,
  Sparkles,
} from "lucide-react";

export default function OnboardingActionsPage() {
  const router = useRouter();
  const { actions, toggleAction } = useAgentForge();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const enabledCount = actions.filter((a) => a.enabled).length;
  const reviewCount = actions.filter((a) => a.needsReview).length;

  const handleToggle = (id: string, requiresConfirmation: boolean) => {
    if (requiresConfirmation) {
      setSelectedActionId(id);
      setConfirmModalOpen(true);
    } else {
      toggleAction(id);
    }
  };

  const getActionIcon = (act: AgentAction) => {
    if (act.category === "social" && act.id.includes("instagram")) {
      return <Instagram className="w-4 h-4 text-pink-500" />;
    }
    if (act.category === "social" && act.id.includes("facebook")) {
      return <Facebook className="w-4 h-4 text-blue-500" />;
    }
    if (act.category === "database") {
      return <Database className="w-4 h-4 text-amber-500" />;
    }
    if (act.category === "security") {
      return <Lock className="w-4 h-4 text-emerald-500" />;
    }
    if (act.category === "finance") {
      return <Shield className="w-4 h-4 text-purple-500" />;
    }
    return <Sliders className="w-4 h-4 text-secondary-text" />;
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
          <span>Step 05 • Action Permissions</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{enabledCount} enabled</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
          Authorize Agent Actions & Capabilities
        </h1>
        <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
          Specify which autonomous tools and external side-effects your AI employee is authorized to invoke during customer interactions.
        </p>
      </div>

      {/* Spacious 2-Column Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {actions.map((act) => (
          <div
            key={act.id}
            className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
              act.enabled
                ? "border-primary-text/40 bg-surface shadow-subtle ring-1 ring-primary-text/10"
                : "border-border bg-surface/70 hover:border-muted-text/40"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-secondary-surface border border-border">
                    {getActionIcon(act)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary-text">{act.name}</h3>
                    {act.tier && (
                      <span className="text-[10px] font-mono text-muted-text uppercase">
                        {act.tier} tier
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-0.5">
                  <Switch
                    checked={act.enabled}
                    onCheckedChange={() =>
                      handleToggle(act.id, act.requiresConfirmation && !act.enabled)
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-secondary-text leading-relaxed pt-1">
                {act.description}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-[11px] font-mono">
              {act.requiresConfirmation && (
                <Badge variant="warning" size="sm" className="text-[10px]">
                  Requires human confirmation
                </Badge>
              )}
              {act.needsReview && (
                <Badge variant="outline" size="sm" className="text-[10px]">
                  Needs review
                </Badge>
              )}
              {!act.requiresConfirmation && !act.needsReview && (
                <span className="text-muted-text">
                  {act.enabled ? "● Autonomous invocation" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <ActionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        actionTitle="Issue refund"
        amount="₹1,299"
        description="This action will issue a refund to the customer's original payment method."
        onConfirm={() => {
          if (selectedActionId) toggleAction(selectedActionId);
        }}
      />

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/brain")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Brain</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/test")}
          className="group shadow-subtle cursor-pointer"
        >
          <span>Proceed to Test Console</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
