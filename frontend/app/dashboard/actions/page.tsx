"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ActionConfirmModal } from "@/components/agent/action-confirm-modal";
import { useAgentForge, AgentAction } from "@/lib/mock-data";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Shield, Lock, Sliders, AlertTriangle } from "lucide-react";

export default function ActionsPage() {
  const { actions, toggleAction } = useAgentForge();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  const enabledCount = actions.filter((a) => a.enabled).length;
  const reviewCount = actions.filter((a) => a.needsReview).length;

  const handleToggle = (action: AgentAction) => {
    // If enabling a sensitive action or toggling refund, prompt modal
    if (action.requiresConfirmation && !action.enabled) {
      setSelectedAction(action);
      setConfirmModalOpen(true);
    } else {
      toggleAction(action.id);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header per PRD Section 23 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
              Actions
            </h1>
            <span className="text-xs font-mono text-muted-text">{enabledCount} enabled</span>
            <span className="text-border">•</span>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
              {reviewCount} needs review
            </span>
          </div>
          <p className="text-xs text-secondary-text">
            Autonomous tools and external side-effects permitted for your agent.
          </p>
        </div>
      </div>

      {/* Action cards list */}
      <div className="space-y-3">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-5 rounded border border-border bg-surface flex items-start justify-between gap-6 transition-colors hover:border-muted-text/40"
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-primary-text">{act.name}</span>
                <StatusIndicator
                  status={act.enabled ? "Live" : "Unavailable"}
                  showText={false}
                  size="sm"
                />
                <span className="text-[11px] font-mono text-secondary-text">
                  {act.enabled ? "● Enabled" : "Disabled"}
                </span>

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

            <div className="pt-1 flex items-center gap-3">
              {act.requiresConfirmation && act.enabled && (
                <button
                  onClick={() => {
                    setSelectedAction(act);
                    setConfirmModalOpen(true);
                  }}
                  className="text-xs text-secondary-text hover:text-primary-text underline font-mono"
                >
                  Simulate authorization
                </button>
              )}
              <Switch
                checked={act.enabled}
                onCheckedChange={() => handleToggle(act)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sensitive Action Modal */}
      <ActionConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        actionTitle={selectedAction?.name || "Refund customer"}
        amount="₹1,299"
        description="This action will issue a refund to the customer's original payment method."
        onConfirm={() => {
          if (selectedAction) toggleAction(selectedAction.id);
        }}
      />
    </div>
  );
}
