"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ActionConfirmModal } from "@/components/agent/action-confirm-modal";
import { EnterpriseInquiryModal } from "@/components/pricing/enterprise-inquiry-modal";
import { useAgentForge, AgentAction } from "@/lib/mock-data";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { usePlanTier, PlanTier } from "@/lib/plan-tier";
import { useToast } from "@/components/ui/toast";
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
  const { tier, config, setTestTier, canUseAction } = usePlanTier();
  const { toast } = useToast();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  const standardActions = actions.filter((a) => a.tier !== "enterprise");
  const enterpriseActions = actions.filter((a) => a.tier === "enterprise");

  const enabledCount = actions.filter((a) => a.enabled).length;
  const reviewCount = actions.filter((a) => a.needsReview).length;

  const handleToggle = (action: AgentAction) => {
    // Check if the current plan tier permits this action
    if (!action.enabled && !canUseAction(action.tier, action.category)) {
      setSelectedAction(action);
      if (action.tier === "enterprise" || action.category === "social" || action.category === "database") {
        setEnterpriseModalOpen(true);
      } else {
        toast(`Action '${action.name}' requires the Growth plan or above. (Current: ${config.name})`, "error");
      }
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

      {/* Active Plan & Live Testing Tier Switcher */}
      <div className="p-4 rounded-xl border border-border bg-secondary-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant={tier === "enterprise" ? "ai" : tier === "growth" ? "neutral" : "outline"}>
            {config.badgeLabel}
          </Badge>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary-text">{config.name}</span>
              <span className="text-muted-text font-mono text-[11px]">({config.pricingLabel})</span>
            </div>
            <p className="text-[11px] text-secondary-text mt-0.5">{config.description}</p>
          </div>
        </div>

        {/* Live Plan Tier Testing Selector (Controlled by NEXT_PUBLIC_TEST_PLAN_TIER or in-UI QA toggle) */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-lg font-mono text-[11px] shrink-0">
          <span className="text-muted-text px-1.5 text-[10px] uppercase tracking-wider font-sans">
            Test Plan:
          </span>
          {(["starter", "growth", "enterprise"] as PlanTier[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTestTier(t);
                toast(`Switched active test plan to ${t.toUpperCase()}`, "info");
              }}
              className={cn(
                "px-2.5 py-1 rounded text-xs capitalize transition-all",
                tier === t
                  ? "bg-primary-text text-background font-semibold shadow-xs"
                  : "text-secondary-text hover:text-primary-text hover:bg-secondary-surface"
              )}
            >
              {t}
            </button>
          ))}
        </div>
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
          {enterpriseActions.map((act) => {
            const isPermitted = canUseAction(act.tier, act.category);
            return (
              <div
                key={act.id}
                className={cn(
                  "p-5 rounded-xl border flex items-start justify-between gap-6 transition-all",
                  isPermitted
                    ? "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40"
                    : "border-border/60 bg-secondary-surface/20 opacity-80"
                )}
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

                    {act.enabled && isPermitted ? (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        ● Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-text flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {!isPermitted ? "Plan Locked" : "Disabled"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed">{act.description}</p>
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <Switch
                    checked={act.enabled && isPermitted}
                    onCheckedChange={() => handleToggle(act)}
                  />
                </div>
              </div>
            );
          })}
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
          {standardActions.map((act) => {
            const isPermitted = canUseAction(act.tier, act.category);
            return (
              <div
                key={act.id}
                className={cn(
                  "p-5 rounded-lg border flex items-start justify-between gap-6 transition-colors",
                  isPermitted
                    ? "border-border bg-surface hover:border-muted-text/40"
                    : "border-border/50 bg-secondary-surface/20 opacity-80"
                )}
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded bg-secondary-surface border border-border">
                      {getActionIcon(act)}
                    </div>
                    <span className="text-sm font-semibold text-primary-text">{act.name}</span>

                    {act.tier && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-secondary-surface text-secondary-text uppercase">
                        {act.tier}
                      </span>
                    )}

                    <StatusIndicator
                      status={act.enabled && isPermitted ? "Live" : "Unavailable"}
                      showText={false}
                      size="sm"
                    />
                    <span className="text-[11px] font-mono text-secondary-text">
                      {act.enabled && isPermitted ? "● Enabled" : !isPermitted ? "Locked (Upgrade)" : "Disabled"}
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
                  {act.requiresConfirmation && act.enabled && isPermitted && (
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
                  checked={act.enabled && isPermitted}
                  onCheckedChange={() => handleToggle(act)}
                />
              </div>
            </div>
            );
          })}
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
