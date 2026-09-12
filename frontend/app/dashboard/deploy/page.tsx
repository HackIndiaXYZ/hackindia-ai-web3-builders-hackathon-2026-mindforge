"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { Check, Copy, ExternalLink, Globe, ShieldCheck, Send, CheckCircle2 } from "lucide-react";

export default function DashboardDeployPage() {
  const { agent, deployAgent, businessBrain } = useAgentForge();
  const { toast } = useToast();

  const [isDeploying, setIsDeploying] = useState(false);
  const [domainInput, setDomainInput] = useState(businessBrain.website.replace("https://", ""));
  const isLive = agent.status === "Live";

  const embedScript = `<script
  src="https://cdn.agentforge.ai/v1/loader.js"
  data-agent-id="${agent.id}"
  data-domain="${domainInput}"
  async>
</script>`;

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      deployAgent();
      toast("Agent deployed to production!", "success");
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(embedScript);
    toast("Copied widget script to clipboard", "success");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
          Deployment & Embed
        </h1>
        <p className="text-xs text-secondary-text mt-0.5">
          Deploy your agent to web domains or connect via customer support channels.
        </p>
      </div>

      {!isLive ? (
        /* Before Deployment */
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-primary-text">Your agent is ready.</h2>
            <p className="text-xs text-secondary-text mt-0.5">
              All preconditions and safety guardrails are satisfied.
            </p>
          </div>

          {/* Checklist per PRD Section 29 */}
          <div className="p-4 rounded border border-border bg-secondary-surface space-y-2.5 font-mono text-xs">
            <div className="flex items-center gap-2 text-primary-text">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Business knowledge (Grounding verified)</span>
            </div>
            <div className="flex items-center gap-2 text-primary-text">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instructions (Safe behavior locked)</span>
            </div>
            <div className="flex items-center gap-2 text-primary-text">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Actions (Thresholds & authorization configured)</span>
            </div>
            <div className="flex items-center gap-2 text-primary-text">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Test completed (Sandbox responses audited)</span>
            </div>
          </div>

          {/* Deployment domain & status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded border border-border bg-surface space-y-1">
              <span className="text-muted-text block">Domain</span>
              <span className="font-mono font-medium text-primary-text">{domainInput}</span>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface space-y-1">
              <span className="text-muted-text block">Status</span>
              <div className="flex items-center gap-1.5">
                <StatusIndicator status="Ready" showText />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="lg"
              variant="primary"
              onClick={handleDeploy}
              isLoading={isDeploying}
            >
              <Send className="w-4 h-4 mr-2" />
              Deploy agent
            </Button>
          </div>
        </Card>
      ) : (
        /* After Deployment per PRD Section 29 */
        <div className="space-y-6">
          <Card className="p-6 space-y-5 border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium block">
                  ✓ Agent deployed
                </span>
                <h2 className="text-xl font-semibold text-primary-text">Your agent is now live.</h2>
              </div>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed">
              Serving real-time inquiries on <span className="font-mono text-primary-text">{domainInput}</span> with active grounding and guardrails.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => toast("Launching live customer widget sandbox...", "info")}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open live agent
              </Button>
              <Button variant="primary" size="md" onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy widget code
              </Button>
            </div>
          </Card>

          {/* Embed snippet */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                Embed Script Tag
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-secondary-text hover:text-primary-text flex items-center gap-1 font-mono"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3.5 rounded bg-secondary-surface text-xs font-mono text-primary-text overflow-x-auto border border-border">
              {embedScript}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
