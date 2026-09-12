"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ActionConfirmModal } from "@/components/agent/action-confirm-modal";
import { EnterpriseInquiryModal } from "@/components/pricing/enterprise-inquiry-modal";
import { useAgentForge, AgentAction } from "@/lib/mock-data";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Shield,
  Lock,
  Sliders,
  AlertTriangle,
  Instagram,
  Facebook,
  Database,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function ActionsPage() {
  const { actions, toggleAction } = useAgentForge();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  const standardActions = actions.filter((a) => a.tier !== "enterprise");
  const enterpriseActions = actions.filter((a) => a.tier === "enterprise");

  const enabledCount = actions.filter((a) => a.enabled).length;
  const reviewCount = actions.filter((a) => a.needsReview).length;

  const handleToggle = (action: AgentAction) => {
    // If it is an enterprise automation and currently disabled, prompt enterprise upgrade
    if (action.tier === "enterprise" && !action.enabled) {
      setSelectedAction(action);
      setEnterpriseModalOpen(true);
      return;
    }

    // If enabling a sensitive action or toggling refund, prompt confirmation modal
    if (action.requiresConfirmation && !action.enabled) {
      setSelectedAction(action);
      setConfirmModalOpen(true);
    } else {
      toggleAction(action.id);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
              Actions & Automations
            </h1>
            <span className="text-xs font-mono text-muted-text">{enabledCount} enabled</span>
            <span className="text-border">•</span>
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
              {reviewCount} needs review
            </span>
          </div>
          <p className="text-xs text-secondary-text">
            Autonomous tools, social channel bots, and live database connectors permitted for your agent.
          </p>
        </div>

        <Link href="/pricing">
          <Button size="sm" variant="secondary" className="text-xs group">
            <span>View Tier Specs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>

      {/* =========================================================================
          SECTION 1: ENTERPRISE AUTOMATIONS (PAY-AS-YOU-GO)
      ========================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-primary-text">
              Enterprise Automations (Pay-As-You-Go)
            </h2>
          </div>
          <Badge variant="ai" size="sm">
            E2E Encrypted • Custom Sync
          </Badge>
        </div>

        <div className="space-y-3">
          {enterpriseActions.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] flex items-start justify-between gap-6 transition-all hover:border-emerald-500/40"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-secondary-surface border border-border">
                    {getActionIcon(act)}
                  </div>
                  <span className="text-sm font-semibold text-primary-text">{act.name}</span>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Enterprise
                  </span>

                  {act.enabled ? (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      ● Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-text flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-secondary-text leading-relaxed">{act.description}</p>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <Switch
                  checked={act.enabled}
                  onCheckedChange={() => handleToggle(act)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: STANDARD CONVERSATIONAL TOOLS
      ========================================================================== */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-secondary-text">
            Standard Conversational Tools
          </h2>
          <p className="text-[11px] text-muted-text mt-0.5">
            Core capabilities available across Starter and Growth tiers.
          </p>
        </div>

        <div className="space-y-3">
          {standardActions.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-lg border border-border bg-surface flex items-start justify-between gap-6 transition-colors hover:border-muted-text/40"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded bg-secondary-surface border border-border">
                    {getActionIcon(act)}
                  </div>
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
                    className="text-xs text-secondary-text hover:text-primary-text underline font-mono cursor-pointer"
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

      {/* Enterprise Upgrade & Channel Inquiry Modal */}
      <EnterpriseInquiryModal
        isOpen={enterpriseModalOpen}
        onClose={() => setEnterpriseModalOpen(false)}
      />
    </div>
  );
}
