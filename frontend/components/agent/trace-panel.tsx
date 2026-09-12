"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Wrench, ShieldAlert, CheckCircle2, Clock, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TraceData {
  sources: string[];
  toolCalls: Array<{ name: string; params: string; output: string }>;
  latencyMs: number;
  tokensUsed: number;
  confidence: number;
  isGrounded: boolean;
  unfoundKnowledge?: boolean;
}

interface TracePanelProps {
  trace?: TraceData;
  onEscalate?: () => void;
  className?: string;
}

export function TracePanel({ trace, onEscalate, className }: TracePanelProps) {
  if (!trace) {
    return (
      <div className={cn("p-5 border border-border rounded bg-surface h-full flex flex-col justify-center items-center text-center", className)}>
        <p className="text-xs text-muted-text">Send a message in the test chat to inspect grounding & tool traces.</p>
      </div>
    );
  }

  return (
    <div className={cn("p-5 border border-border rounded bg-surface h-full flex flex-col space-y-5 overflow-y-auto", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">Why this answer?</h4>
        <span className="text-[11px] font-mono text-muted-text flex items-center gap-1">
          <Clock className="w-3 h-3" /> {trace.latencyMs}ms
        </span>
      </div>

      {/* Trust State: Not found in knowledge */}
      {trace.unfoundKnowledge ? (
        <div className="p-3.5 rounded border border-amber-500/30 bg-amber-500/5 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Not found in business knowledge</span>
          </div>
          <p className="text-xs text-secondary-text leading-relaxed">
            The agent did not find enough verified information to confidently answer this question.
          </p>
          {onEscalate && (
            <Button size="sm" variant="secondary" onClick={onEscalate} className="w-full text-xs">
              Escalate to human
            </Button>
          )}
        </div>
      ) : (
        /* Grounding Status */
        <div className="p-3 rounded border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Grounded in business knowledge</span>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            {trace.confidence}% conf
          </span>
        </div>
      )}

      {/* Sources */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-secondary-text">Sources</span>
        {trace.sources.length > 0 ? (
          <div className="space-y-1.5">
            {trace.sources.map((src, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded border border-border bg-secondary-surface text-xs font-mono text-primary-text"
              >
                <FileText className="w-3.5 h-3.5 text-secondary-text flex-shrink-0" />
                <span className="truncate">{src}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-text italic">No sources referenced.</p>
        )}
      </div>

      {/* Tool Calls */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-secondary-text">Tool Calls</span>
        {trace.toolCalls.length > 0 ? (
          <div className="space-y-2">
            {trace.toolCalls.map((tc, idx) => (
              <div key={idx} className="p-2.5 rounded border border-border bg-secondary-surface text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-primary-text font-medium">
                  <Wrench className="w-3.5 h-3.5 text-secondary-text" />
                  <span>{tc.name}</span>
                </div>
                <div className="font-mono text-[11px] text-muted-text truncate">arg: {tc.params}</div>
                <div className="text-[11px] text-secondary-text bg-surface p-1.5 rounded border border-border/50">
                  {tc.output}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-text italic">No tools invoked.</p>
        )}
      </div>

      {/* Response Metadata */}
      <div className="pt-2 border-t border-border/60 text-[11px] text-muted-text flex items-center justify-between font-mono">
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Anthropic Claude 3.5 Sonnet
        </span>
        <span>{trace.tokensUsed} tokens</span>
      </div>
    </div>
  );
}
