"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { Check, Copy, ExternalLink, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingDeployPage() {
  const router = useRouter();
  const { deployAgent, agent } = useAgentForge();
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          {isDeployed ? "Agent Deployed" : "Ready to Deploy"}
        </h2>
        <p className="text-xs text-secondary-text mt-1">
          {isDeployed
            ? "Your agent is now live and serving customer inquiries."
            : "Review the pre-flight readiness checklist before going live."}
        </p>
      </div>

      {!isDeployed ? (
        <div className="space-y-5 pt-2">
          {/* Pre-flight checklist */}
          <div className="p-4 rounded border border-border bg-secondary-surface space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Pre-flight Checklist
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-primary-text">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Business knowledge (142 pages verified)</span>
              </div>
              <div className="flex items-center gap-2 text-primary-text">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instructions & Guardrails locked</span>
              </div>
              <div className="flex items-center gap-2 text-primary-text">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Actions authorized & thresholds configured</span>
              </div>
              <div className="flex items-center gap-2 text-primary-text">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Test simulation passed (Grounding verified)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded border border-border bg-surface flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-text block">Target Domain</span>
              <span className="font-mono font-medium text-primary-text">acme.com</span>
            </div>
            <StatusIndicator status="Ready" showText />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/test")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleDeploy}
              isLoading={isDeploying}
            >
              Deploy agent
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 pt-2">
          <div className="p-5 rounded border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-primary-text">Your agent is now live.</h3>
            <p className="text-xs text-secondary-text max-w-sm mx-auto">
              Ready to answer customer questions and handle authorized business workflows on acme.com.
            </p>
          </div>

          {/* Snippet Card */}
          <div className="p-4 rounded border border-border bg-surface space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-secondary-text">Web Widget Embed Script</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-primary-text hover:text-muted-text font-mono transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy code</span>
              </button>
            </div>
            <pre className="p-3 rounded bg-secondary-surface text-[11px] font-mono text-primary-text overflow-x-auto border border-border">
              {snippet}
            </pre>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Button variant="secondary" size="md" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy widget code
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard")}
              className="group"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
