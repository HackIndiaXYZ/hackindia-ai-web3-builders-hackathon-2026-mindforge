"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import {
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  ShieldCheck,
  Send,
  MessageSquare,
  Globe,
} from "lucide-react";

export default function OnboardingDeployPage() {
  const router = useRouter();
  const { deployAgent, businessBrain } = useAgentForge();
  const { toast } = useToast();

  const [isDeployed, setIsDeployed] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const snippet = `<script src="https://cdn.agentforge.ai/v1/embed.js" data-agent-id="AGT-48291" async></script>`;

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      deployAgent();
      toast("Agent deployed successfully!", "success");
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippet);
    toast("Copied embed script to clipboard", "success");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
          <span>Step 07 • Production Deployment</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {isDeployed ? "Live in Production" : "Pre-flight Readiness"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
          {isDeployed ? "Your AI Employee is Live!" : "Ready to Deploy to Production"}
        </h1>
        <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
          {isDeployed
            ? "Your autonomous agent is active and ready to handle customer inquiries, capture leads, and invoke authorized workflows."
            : "Review the pre-flight readiness checklist before publishing your autonomous agent to your live website."}
        </p>
      </div>

      {/* Spacious 2-Column Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checklist / Embed Code */}
        <div className="lg:col-span-7 space-y-6">
          {!isDeployed ? (
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                  Pre-flight Verification Checklist
                </span>
                <Badge variant="ai" size="sm">
                  100% Ready
                </Badge>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-lg bg-secondary-surface/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-primary-text">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Business Knowledge Base (142 pages indexed)</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Verified</span>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary-surface/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-primary-text">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Prompt Instructions & Safety Guardrails Locked</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Compiled</span>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary-surface/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-primary-text">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Authorized Actions & Escalation Thresholds Active</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Authorized</span>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary-surface/40 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-primary-text">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Zero-Data Retention VPC Encryption Active</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Secured</span>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-secondary-surface/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-text font-mono text-[11px] block">Target Domain Deployment</span>
                  <span className="font-semibold text-primary-text text-sm">
                    {businessBrain.website || "acme.com"}
                  </span>
                </div>
                <StatusIndicator status="Ready" showText />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full shadow-elevated group cursor-pointer text-sm"
                >
                  {isDeploying ? (
                    <span>Deploying Infrastructure...</span>
                  ) : (
                    <>
                      <span>Deploy Autonomous AI Employee</span>
                      <Sparkles className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-8 space-y-6">
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text">
                  Your AI Employee is Officially Live
                </h3>
                <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed">
                  Serving customer inquiries, capturing prospective leads, and handling authorized business workflows on {businessBrain.website || "your website"}.
                </p>
              </div>

              {/* Snippet Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-secondary-text font-mono">
                    Embed Script (Paste Before &lt;/body&gt;)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-primary-text hover:text-muted-text font-mono transition-colors cursor-pointer py-1 px-2 rounded hover:bg-secondary-surface"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-secondary-surface text-xs font-mono text-primary-text overflow-x-auto border border-border">
                  {snippet}
                </pre>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={handleCopy} className="cursor-pointer">
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span>Copy Script</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push("/dashboard")}
                  className="group shadow-subtle cursor-pointer flex-1"
                >
                  <span>Open Operational Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mockup of Website Embed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                Live Widget Mockup
              </span>
              <span className="text-[11px] font-mono text-muted-text">Preview</span>
            </div>

            {/* Mock Website Container */}
            <div className="rounded-lg border border-border bg-background overflow-hidden shadow-inner h-[380px] flex flex-col justify-between p-4 relative">
              {/* Mock Browser Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-border/70 text-[11px] text-muted-text">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono truncate max-w-[150px]">
                  {businessBrain.website || "acme.com"}
                </span>
                <Globe className="w-3.5 h-3.5" />
              </div>

              {/* Mock Website Content */}
              <div className="space-y-2 py-4 text-center">
                <h4 className="text-sm font-semibold text-primary-text">
                  {businessBrain.companyName || "Acme Technologies"}
                </h4>
                <p className="text-[11px] text-secondary-text max-w-[200px] mx-auto">
                  Welcome to our online portal. We provide standard support & services.
                </p>
              </div>

              {/* Floating Chat Widget Popup */}
              <div className="self-end w-64 bg-surface border border-border rounded-xl shadow-elevated overflow-hidden text-xs">
                <div className="p-2.5 bg-primary-text text-background flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Bot className="w-3.5 h-3.5" />
                    <span>{businessBrain.companyName || "Acme"} Support</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                <div className="p-3 space-y-2 bg-secondary-surface/30">
                  <div className="p-2 rounded bg-surface border border-border/70 text-[11px] text-secondary-text">
                    Hi! I'm your AI assistant. How can I help with {businessBrain.companyName || "our services"} today?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/test")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Test</span>
        </Button>
      </div>
    </div>
  );
}
