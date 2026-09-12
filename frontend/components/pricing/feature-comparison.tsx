"use client";

import React from "react";
import { Check, X, Shield, Sparkles, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeatureRow {
  name: string;
  tooltip?: string;
  starter: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
  highlight?: boolean;
}

interface FeatureSection {
  category: string;
  features: FeatureRow[];
}

const COMPARISON_DATA: FeatureSection[] = [
  {
    category: "Core AI & Memory",
    features: [
      {
        name: "Autonomous AI Employees",
        starter: "1 AI Employee",
        growth: "Up to 3 AI Employees",
        enterprise: "Unlimited Dedicated",
      },
      {
        name: "Monthly Conversation Volume",
        starter: "500 / month",
        growth: "Unlimited",
        enterprise: "Pay-As-You-Go Scale",
      },
      {
        name: "Custom AI Memory & Knowledge Base",
        tooltip: "RAG vector retrieval from uploaded PDFs, handbooks, and crawled website URLs.",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        name: "Custom Prompt Instructions & Guardrails",
        tooltip: "Directly tell the AI what to say, tone of voice, refund answers, and strictly restricted topics.",
        starter: true,
        growth: true,
        enterprise: true,
        highlight: true,
      },
      {
        name: "Real-time Operational Analytics",
        tooltip: "Live dashboard tracking conversation volume, sentiment, latency, and resolution rate.",
        starter: true,
        growth: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Channels & Lead Management",
    features: [
      {
        name: "Floating Web Chat Widget",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        name: "Custom Domain & Remove Branding",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        name: "Lead Capture CRM Table & Export",
        tooltip: "Automatically capture customer emails, phone numbers, and interests into a structured table.",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        name: "Multilingual Auto-Translation",
        starter: false,
        growth: "50+ Languages",
        enterprise: "Global Neural Omni",
      },
    ],
  },
  {
    category: "Automations & Integrations",
    features: [
      {
        name: "Instagram Page Automation",
        tooltip: "Automated direct messages (DMs), comment replies on posts/reels, and story mention responses.",
        starter: false,
        growth: false,
        enterprise: true,
        highlight: true,
      },
      {
        name: "Facebook Page Automation",
        tooltip: "24/7 automated Messenger responses and page post interaction sync.",
        starter: false,
        growth: false,
        enterprise: true,
        highlight: true,
      },
      {
        name: "Live Enterprise Database Connector",
        tooltip: "Direct real-time read/write SQL query connector to PostgreSQL, MySQL, Supabase, and custom APIs.",
        starter: false,
        growth: false,
        enterprise: true,
        highlight: true,
      },
      {
        name: "Autonomous Background Task Pipelines",
        tooltip: "Multi-step tool executions, webhook dispatches, and scheduled jobs.",
        starter: false,
        growth: false,
        enterprise: true,
        highlight: true,
      },
    ],
  },
  {
    category: "Security & Dedicated Infrastructure",
    features: [
      {
        name: "Full Private End-to-End Encrypted Employee",
        tooltip: "Zero-retention client-side encrypted vector store and isolated VPC compute.",
        starter: false,
        growth: false,
        enterprise: true,
        highlight: true,
      },
      {
        name: "Web3 Cryptographic Identity Anchor",
        tooltip: "Permanent hash anchoring on Base / MST blockchain for immutable audit verification.",
        starter: false,
        growth: false,
        enterprise: true,
      },
      {
        name: "SOC2 Compliance & Immutable Audit Logs",
        starter: false,
        growth: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support & SLA",
    features: [
      {
        name: "Support Channel",
        starter: "Community",
        growth: "Priority Email & Discord",
        enterprise: "Dedicated Slack & Solution Architect",
      },
      {
        name: "Uptime SLA",
        starter: "Standard",
        growth: "Standard",
        enterprise: "99.9% Financial SLA",
      },
    ],
  },
];

export function FeatureComparisonTable() {
  const renderCell = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
      ) : (
        <X className="w-4 h-4 text-muted-text/50 mx-auto" />
      );
    }
    return <span className="text-xs font-medium text-primary-text">{val}</span>;
  };

  return (
    <div className="w-full space-y-6 pt-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary-text">
          Detailed Capability Breakdown
        </h2>
        <p className="text-xs sm:text-sm text-secondary-text">
          Compare features across all tiers. Need hands-off social automation and database connections? Choose Enterprise.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b border-border bg-secondary-surface/60">
              <th className="p-4 sm:p-5 font-semibold text-primary-text w-2/5">Capabilities</th>
              <th className="p-4 sm:p-5 font-semibold text-primary-text text-center w-1/5">
                <div>Starter</div>
                <div className="text-[11px] font-normal text-muted-text">$0 / month</div>
              </th>
              <th className="p-4 sm:p-5 font-semibold text-primary-text text-center w-1/5 bg-primary-text/5">
                <div className="inline-flex items-center gap-1">
                  <span>Growth</span>
                  <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-[10px]">
                    No Automations
                  </Badge>
                </div>
                <div className="text-[11px] font-normal text-muted-text">$49 / month</div>
              </th>
              <th className="p-4 sm:p-5 font-semibold text-primary-text text-center w-1/5">
                <div className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span>Enterprise</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="text-[11px] font-normal text-muted-text">Pay-As-You-Go</div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border/60">
            {COMPARISON_DATA.map((section) => (
              <React.Fragment key={section.category}>
                {/* Category Header Row */}
                <tr className="bg-secondary-surface/30 font-semibold text-secondary-text text-[11px] uppercase tracking-wider font-mono">
                  <td colSpan={4} className="px-4 sm:px-5 py-2.5">
                    {section.category}
                  </td>
                </tr>

                {/* Features Rows */}
                {section.features.map((feat) => (
                  <tr
                    key={feat.name}
                    className={`hover:bg-secondary-surface/20 transition-colors ${
                      feat.highlight ? "bg-emerald-500/[0.02]" : ""
                    }`}
                  >
                    <td className="p-4 sm:p-5 text-secondary-text">
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary-text font-medium">{feat.name}</span>
                        {feat.tooltip && (
                          <span
                            title={feat.tooltip}
                            className="text-muted-text hover:text-primary-text cursor-help"
                          >
                            <HelpCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-center">{renderCell(feat.starter)}</td>
                    <td className="p-4 sm:p-5 text-center bg-primary-text/5">
                      {renderCell(feat.growth)}
                    </td>
                    <td className="p-4 sm:p-5 text-center">{renderCell(feat.enterprise)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
