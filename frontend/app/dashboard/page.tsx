"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";
import { ConfigurationPulse } from "@/components/agent/configuration-pulse";
import { useAgentForge } from "@/lib/mock-data";
import {
  Brain,
  Database,
  Bot,
  Send,
  ArrowUpRight,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { agent, sources, actions, conversations, isPulseActive, triggerPulse } =
    useAgentForge();

  return (
    <div className="space-y-8">
      {/* Top Banner: Agent identity & status overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-muted-text">{agent.id}</span>
            <span className="text-border text-xs">•</span>
            <Badge variant="success" size="sm">
              Verified Employee
            </Badge>
            <ConfigurationPulse isActive={isPulseActive} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            {agent.name}
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Autonomous customer operations representative grounded in Acme business knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/test">
            <Button variant="secondary" size="md">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Test Console
            </Button>
          </Link>
          <Link href="/dashboard/deploy">
            <Button variant="primary" size="md">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {agent.status === "Live" ? "View Deployment" : "Deploy Agent"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Metrics Cards (PRD Section 28) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversations"
          value="1,284"
          change="+12.4%"
          changeType="positive"
          detail="Past 30 days"
        />
        <StatCard
          label="Resolution rate"
          value="87.4%"
          change="+2.1%"
          changeType="positive"
          detail="Target: >85%"
        />
        <StatCard
          label="Escalations"
          value="8.2%"
          change="-0.8%"
          changeType="positive"
          detail="105 transferred to tier-2"
        />
        <StatCard
          label="Avg response"
          value="1.2s"
          change="-0.3s"
          changeType="positive"
          detail="P95 latency: 2.1s"
        />
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Business Brain Card */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-text" />
                <CardTitle>Business Brain</CardTitle>
              </div>
              <Badge variant="ai" size="sm">
                Active
              </Badge>
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              Operating rules, refund guarantees, and support guidelines synthesized from your documents.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-text">4 Core Sections</span>
            <Link
              href="/dashboard/business-brain"
              className="text-xs font-medium text-primary-text hover:underline inline-flex items-center"
            >
              Review Brain <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Knowledge Base Card */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary-text" />
                <CardTitle>Knowledge Sources</CardTitle>
              </div>
              <StatusIndicator status="Synced" showText size="sm" />
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              {sources.length} active sources synced. 276 total pages vectorized with continuous index updates.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-text">12 Sources Total</span>
            <Link
              href="/dashboard/knowledge"
              className="text-xs font-medium text-primary-text hover:underline inline-flex items-center"
            >
              Manage Sources <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Guarded Actions Card */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-text" />
                <CardTitle>Tool Actions</CardTitle>
              </div>
              <span className="text-xs font-mono text-secondary-text">
                {actions.filter((a) => a.enabled).length} Enabled
              </span>
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              Autonomous refund authorizations, ticket creations, and order lookups with human approval gates.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
              1 Needs Review
            </span>
            <Link
              href="/dashboard/actions"
              className="text-xs font-medium text-primary-text hover:underline inline-flex items-center"
            >
              Configure Actions <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity / Conversations Snapshot (PRD Section 27) */}
      <div className="border border-border rounded bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-primary-text">Live Conversation Stream</h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Recent customer interactions handled autonomously.
            </p>
          </div>
          <Link href="/dashboard/conversations">
            <Button size="sm" variant="ghost">
              <span>View all conversations</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          {conversations.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href="/dashboard/conversations"
              className="p-3 rounded border border-border bg-secondary-surface/40 hover:bg-secondary-surface flex items-center justify-between text-xs transition-colors block"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary-text font-medium">
                    Customer #{c.customerNumber}
                  </span>
                  <span className="text-border">•</span>
                  <span className="text-secondary-text font-medium">"{c.initialQuery}"</span>
                </div>
                <p className="text-[11px] text-muted-text truncate max-w-xl">{c.snippet}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-muted-text">{c.timestamp}</span>
                {c.status === "resolved" ? (
                  <Badge variant="success" size="sm">
                    Resolved ✓
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Escalated →
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
