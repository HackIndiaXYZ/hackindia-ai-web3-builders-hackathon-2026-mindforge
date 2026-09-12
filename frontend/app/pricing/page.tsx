"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleOnboardClick = () => {
    if (isAuthenticated) {
      router.push("/onboarding");
    } else {
      router.push("/login?redirect=/onboarding");
    }
  };

  const TIERS = [
    {
      name: "Starter",
      badge: "Free forever",
      price: "$0",
      period: "/ month",
      description: "Ideal for testing your first business AI employee and embedding web chat.",
      features: [
        "1 Autonomous AI Employee",
        "500 customer conversations / mo",
        "Full website RAG & policy crawling",
        "Embeddable floating Web Chat widget",
        "Standard community support",
      ],
      cta: "Onboard Your Own AI",
      highlighted: false,
    },
    {
      name: "Growth",
      badge: "Most popular",
      price: "$49",
      period: "/ month",
      description: "For growing businesses requiring appointment scheduling and lead capturing.",
      features: [
        "3 Autonomous AI Employees",
        "Unlimited conversations & messages",
        "Custom domain & white-labeling",
        "Automated appointment booking engine",
        "Customer leads CRM table & export",
        "Business Brain live editor portal",
        "Priority email & Slack support",
      ],
      cta: "Onboard Your Own AI",
      highlighted: true,
    },
    {
      name: "Enterprise",
      badge: "Scale",
      price: "$199",
      period: "/ month",
      description: "Dedicated infrastructure, custom integrations, and SLA guarantees.",
      features: [
        "Unlimited AI Employees & Workspaces",
        "Custom Knowledge API integration",
        "Cryptographic Web3 identity anchor",
        "Automated phone voice calling tier",
        "SOC2 compliance & audit logs",
        "Dedicated account solution architect",
      ],
      cta: "Onboard Your Own AI",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text">
            <span>Transparent, predictable pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold text-primary-text tracking-tight">
            Simple Plans for Autonomous Scale
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
            Deploy an AI employee that pays for itself on day one. Upgrade anytime as your customer demand grows.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`p-6 flex flex-col justify-between transition-all duration-200 relative ${
                tier.highlighted
                  ? "border-primary-text shadow-elevated"
                  : "border-border hover:border-muted-text/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-primary-text">{tier.name}</span>
                  <Badge variant={tier.highlighted ? "ai" : "neutral"} size="sm">
                    {tier.badge}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-semibold tracking-tight text-primary-text">
                    {tier.price}
                  </span>
                  <span className="text-xs text-secondary-text">{tier.period}</span>
                </div>

                <p className="text-xs text-secondary-text leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider block font-mono">
                    Included capabilities:
                  </span>
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs text-secondary-text">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <Button
                  onClick={handleOnboardClick}
                  variant={tier.highlighted ? "primary" : "secondary"}
                  size="md"
                  className="w-full group"
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 rounded border border-border bg-surface text-center max-w-xl mx-auto space-y-1 text-xs">
          <p className="font-medium text-primary-text">Free 14-day full feature trial</p>
          <p className="text-secondary-text">
            No credit card required for Starter tier. Instant cancellation and data exports.
          </p>
        </div>
      </main>
    </div>
  );
}
