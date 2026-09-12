"use client";

import React from "react";
import { TestConsole } from "@/components/agent/test-console";
import { Badge } from "@/components/ui/badge";
import { useAgentForge } from "@/lib/mock-data";
import { ConfigurationPulse } from "@/components/agent/configuration-pulse";

export default function DashboardTestConsolePage() {
  const { agent, isPulseActive } = useAgentForge();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-text">{agent.id}</span>
            <span className="text-border">•</span>
            <Badge variant="ai">Live Grounding</Badge>
            <ConfigurationPulse isActive={isPulseActive} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            Agent Test Console
          </h1>
          <p className="text-xs text-secondary-text mt-0.5">
            Test and audit your agent's live behavior, citations, and deterministic tool calls.
          </p>
        </div>
      </div>

      <TestConsole />
    </div>
  );
}
