"use client";

import { useState, useEffect } from "react";

export type PlanTier = "starter" | "growth" | "enterprise";

export interface TierConfig {
  id: PlanTier;
  name: string;
  badgeLabel: string;
  pricingLabel: string;
  description: string;
  allowAutomations: boolean;
  allowSocialAutomations: boolean;
  allowDatabaseConnector: boolean;
  allowPrivateVault: boolean;
  allowCustomDomain: boolean;
  whiteLabel: boolean;
  maxSources: number;
}

export const TIER_CONFIGS: Record<PlanTier, TierConfig> = {
  starter: {
    id: "starter",
    name: "Starter Plan",
    badgeLabel: "Starter Tier",
    pricingLabel: " / mo",
    description: "Essential AI Support Assistant, grounding analytics, and custom AI memory.",
    allowAutomations: false,
    allowSocialAutomations: false,
    allowDatabaseConnector: false,
    allowPrivateVault: false,
    allowCustomDomain: false,
    whiteLabel: false,
    maxSources: 3,
  },
  growth: {
    id: "growth",
    name: "Growth Plan",
    badgeLabel: "Growth Tier",
    pricingLabel: " / mo",
    description: "Expanded business scale, ticketing integrations, custom domain & priority RAG.",
    allowAutomations: true,
    allowSocialAutomations: false,
    allowDatabaseConnector: false,
    allowPrivateVault: false,
    allowCustomDomain: true,
    whiteLabel: true,
    maxSources: 25,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Pay-As-You-Go",
    badgeLabel: "Enterprise Tier",
    pricingLabel: "Custom / Pay-As-You-Go",
    description: "Fully private encrypted AI employee with social page automations and real-time database connectors.",
    allowAutomations: true,
    allowSocialAutomations: true,
    allowDatabaseConnector: true,
    allowPrivateVault: true,
    allowCustomDomain: true,
    whiteLabel: true,
    maxSources: 9999,
  },
};

export function getDefaultTier(): PlanTier {
  const envTier = (process.env.NEXT_PUBLIC_TEST_PLAN_TIER || "starter").toLowerCase() as PlanTier;
  if (envTier === "enterprise" || envTier === "growth" || envTier === "starter") {
    return envTier;
  }
  return "starter";
}

export function usePlanTier() {
  const [tier, setTierState] = useState<PlanTier>(getDefaultTier());

  useEffect(() => {
    // Check if user set an explicit override in localStorage for live testing
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("agentforge_test_tier") as PlanTier | null;
      if (stored && (stored === "starter" || stored === "growth" || stored === "enterprise")) {
        setTierState(stored);
      } else {
        setTierState(getDefaultTier());
      }
    }
  }, []);

  const setTestTier = (newTier: PlanTier) => {
    setTierState(newTier);
    if (typeof window !== "undefined") {
      localStorage.setItem("agentforge_test_tier", newTier);
      // Dispatch storage event so other open tabs/components sync immediately
      window.dispatchEvent(new Event("storage"));
    }
  };

  const config = TIER_CONFIGS[tier];

  const canUseAction = (actionTier?: "starter" | "growth" | "enterprise", category?: string): boolean => {
    if (tier === "enterprise") return true;

    if (tier === "growth") {
      // Growth allows standard support/finance actions, but NOT enterprise social or DB connectors
      if (actionTier === "enterprise") return false;
      if (category === "social" || category === "database" || category === "security") return false;
      return true;
    }

    // Starter plan only allows basic non-automation support assistance (e.g. basic query handling)
    if (tier === "starter") {
      if (actionTier === "growth" || actionTier === "enterprise") return false;
      if (category === "finance" || category === "social" || category === "database" || category === "security") return false;
      // In starter, only standard safe support actions are permitted
      return true;
    }

    return false;
  };

  return {
    tier,
    config,
    setTestTier,
    canUseAction,
    isStarter: tier === "starter",
    isGrowth: tier === "growth",
    isEnterprise: tier === "enterprise",
  };
}
