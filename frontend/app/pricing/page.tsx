"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { EnterpriseInquiryModal } from "@/components/pricing/enterprise-inquiry-modal";
import { FeatureComparisonTable } from "@/components/pricing/feature-comparison";
import {
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Instagram,
  Facebook,
  Database,
  Lock,
  Sliders,
  Zap,
} from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [volumeSlider, setVolumeSlider] = useState(25000);

  const handleOnboardClick = (tierName: string) => {
    if (tierName === "Enterprise") {
      setEnterpriseModalOpen(true);
      return;
    }

    if (isAuthenticated) {
      router.push("/onboarding");
    } else {
      router.push("/login?redirect=/onboarding");
    }
  };

  // Pay-As-You-Go estimation math
  const getEstimatedCost = (vol: number) => {
    // Volume tiering: base platform + $0.015 - $0.025 per conversation
    const base = 299;
    const variable = Math.round(vol * 0.018);
    return base + variable;
  };

  const TIERS = [
    {
      name: "Starter",
      badge: "Free forever",
      price: "$0",
      period: "/ month",
      description:
        "Basic 24/7 AI support assistant with analytics and custom memory. Full freedom to instruct the AI what to tell your customers.",
      features: [
        "1 Autonomous AI Employee",
        "500 customer conversations / mo",
        "Embeddable floating Web Chat widget",
        "Real-time analytics dashboard",
        "Custom AI memory (PDF & Web RAG)",
        "Custom customer instructions & prompt guardrails",
        "Standard community support",
      ],
      cta: "Onboard Your AI Free",
      highlighted: false,
    },
    {
      name: "Growth",
      badge: "Most popular",
      price: "$49",
      period: "/ month",
      description:
        "Expanded conversational scale, multiple AI employees, lead capture CRM, and white-labeling — without automation complexity.",
      features: [
        "Up to 3 Autonomous AI Employees",
        "Unlimited customer conversations",
        "Customer leads CRM table & CSV export",
        "Custom domain & remove 'Powered by AgentForge'",
        "Live human-in-the-loop escalation alerts",
        "Multilingual translation (50+ languages)",
        "Priority email & community support",
        "🚫 No background automations included",
      ],
      cta: "Get Started with Growth",
      highlighted: true,
    },
    {
      name: "Enterprise",
      badge: "Scale & Automate",
      price: "Pay-As-You-Go",
      period: "Custom usage",
      description:
        "Full private end-to-end encrypted employee with Instagram & Facebook page automations and live enterprise database sync.",
      features: [
        "Unlimited Dedicated AI Employees",
        "Instagram Page Automation (DMs & comments)",
        "Facebook Page Automation (Messenger & posts)",
        "Full Private End-to-End Encrypted Employee",
        "Live Enterprise Database Connectors (Postgres/Supabase)",
        "Full autonomous background workflow pipelines",
        "Web3 cryptographic identity & audit anchor",
        "99.9% Uptime SLA & Dedicated Solution Architect",
      ],
      cta: "Configure Enterprise Plan",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white dark:selection:bg-neutral-200 dark:selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 space-y-16">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Intelligence • Predictable Scaling</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold text-primary-text tracking-tight">
            Plans Built for Your AI Workforce
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text leading-relaxed max-w-xl mx-auto">
            Deploy an AI employee tailored to your brand. From free conversational support to full private end-to-end encrypted enterprise automations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`p-6 flex flex-col justify-between transition-all duration-200 relative ${
                tier.highlighted
                  ? "border-primary-text shadow-elevated bg-surface ring-1 ring-primary-text/20"
                  : "border-border hover:border-muted-text/50 bg-surface/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold text-primary-text">{tier.name}</span>
                  <Badge variant={tier.highlighted ? "ai" : "neutral"} size="sm">
                    {tier.badge}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1.5 my-4">
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary-text">
                    {tier.price}
                  </span>
                  <span className="text-xs text-secondary-text font-medium">{tier.period}</span>
                </div>

                <p className="text-xs text-secondary-text leading-relaxed mb-6 min-h-[48px]">
                  {tier.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block font-mono">
                    Included capabilities:
                  </span>
                  {tier.features.map((f) => {
                    const isExclusion = f.startsWith("🚫");
                    return (
                      <div key={f} className="flex items-start gap-2.5 text-xs">
                        {isExclusion ? (
                          <span className="text-xs text-amber-500 font-mono font-medium">{f}</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-secondary-text">{f}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <Button
                  onClick={() => handleOnboardClick(tier.name)}
                  variant={tier.highlighted ? "primary" : "secondary"}
                  size="md"
                  className="w-full group shadow-subtle cursor-pointer"
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* =========================================================================
            PAY-AS-YOU-GO USAGE CALCULATOR FOR ENTERPRISE
        ========================================================================== */}
        <div className="p-8 rounded-2xl border border-border bg-surface/90 shadow-elevated relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Enterprise Pay-As-You-Go Estimator</span>
              </div>
              <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
                Scale Pay-As-You-Go With Zero Waste
              </h2>
              <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                Only pay for what your AI employee actually resolves. Includes full private end-to-end encrypted memory, Instagram & Facebook page automations, and direct database querying.
              </p>

              {/* Slider Controller */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-secondary-text font-medium">Estimated Monthly Conversations:</span>
                  <span className="font-mono text-primary-text font-semibold text-sm">
                    {volumeSlider.toLocaleString()} conversations / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={volumeSlider}
                  onChange={(e) => setVolumeSlider(Number(e.target.value))}
                  className="w-full accent-primary-text cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-muted-text">
                  <span>5,000</span>
                  <span>50,000</span>
                  <span>100,000</span>
                  <span>200,000+</span>
                </div>
              </div>
            </div>

            {/* Estimation Summary Box */}
            <div className="lg:col-span-5 p-6 rounded-xl border border-border bg-secondary-surface/60 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-secondary-text">Estimated Monthly Range</span>
                <div className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
                  ${getEstimatedCost(volumeSlider).toLocaleString()}
                  <span className="text-xs font-normal text-muted-text font-mono"> / mo</span>
                </div>
                <p className="text-[11px] text-muted-text">
                  ~${(getEstimatedCost(volumeSlider) / volumeSlider).toFixed(3)} per resolved interaction
                </p>
              </div>

              <div className="space-y-2 text-xs text-secondary-text pt-3 border-t border-border/80">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instagram & Facebook Page Automations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Private End-to-End Encrypted Employee Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Database Connector (SQL/Supabase)</span>
                </div>
              </div>

              <Button
                onClick={() => setEnterpriseModalOpen(true)}
                variant="primary"
                size="md"
                className="w-full shadow-subtle group mt-2 cursor-pointer"
              >
                <span>Book Architecture Review</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DETAILED FEATURE COMPARISON TABLE
        ========================================================================== */}
        <FeatureComparisonTable />

        {/* Guarantee Banner */}
        <div className="p-6 rounded-xl border border-border bg-surface text-center max-w-xl mx-auto space-y-1.5 text-xs shadow-subtle">
          <p className="font-semibold text-primary-text">Free 14-day full trial on Growth</p>
          <p className="text-secondary-text leading-relaxed">
            No credit card required for Starter tier. Custom contracts and dedicated NDAs available for Enterprise pay-as-you-go deployments.
          </p>
        </div>
      </main>

      {/* Enterprise Inquiry Modal */}
      <EnterpriseInquiryModal
        isOpen={enterpriseModalOpen}
        onClose={() => setEnterpriseModalOpen(false)}
        defaultVolume={volumeSlider}
      />
    </div>
  );
}
