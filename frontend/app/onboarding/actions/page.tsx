"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ActionConfirmModal } from "@/components/agent/action-confirm-modal";
import { useAgentForge } from "@/lib/mock-data";
import { ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 text-xs text-secondary-text mb-1">
          <span className="font-semibold text-primary-text">{enabledCount} enabled</span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400">{reviewCount} needs review</span>
        </div>
        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          Configure Agent Actions
        </h2>
        <p className="text-xs text-secondary-text mt-1">
          Select which tool capabilities the agent is authorized to autonomously execute.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded border border-border bg-surface flex items-start justify-between gap-4 transition-colors hover:border-muted-text/40"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-text">{act.name}</span>
                {act.requiresConfirmation && (
                  <Badge variant="warning" size="sm">
                    Requires confirmation
                  </Badge>
                )}
                {act.needsReview && (
                  <Badge variant="outline" size="sm">
                    Needs review
                  </Badge>
                )}
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">{act.description}</p>
            </div>

            <div className="pt-0.5">
              <Switch
                checked={act.enabled}
                onCheckedChange={() => handleToggle(act.id, act.requiresConfirmation && !act.enabled)}
              />
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

      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/brain")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/test")}
          className="group"
        >
          <span>Proceed to Test</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
