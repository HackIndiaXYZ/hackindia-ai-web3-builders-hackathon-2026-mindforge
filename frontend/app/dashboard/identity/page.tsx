"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { Fingerprint, ShieldCheck, Copy, KeyRound, Cpu, Clock } from "lucide-react";

export default function IdentityPage() {
  const { agent } = useAgentForge();
  const { toast } = useToast();

  const handleCopyFingerprint = () => {
    navigator.clipboard?.writeText("e2f8a19b-84F2-4e67-9c88-72b6a98218d4");
    toast("Copied cryptographic identity key to clipboard", "success");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
          Agent Identity
        </h1>
        <p className="text-xs text-secondary-text mt-0.5">
          Cryptographic provenance, verified signing authority, and employee identification.
        </p>
      </div>

      {/* Main Identity Manifest matching PRD Section 30 */}
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-text uppercase tracking-wider font-mono">
              Agent Identity
            </span>
            <h2 className="text-xl font-semibold text-primary-text">{agent.name}</h2>
            <p className="text-xs text-secondary-text">{agent.role}</p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/80 text-xs">
          <div className="space-y-1">
            <span className="text-muted-text font-mono text-[11px] uppercase">Agent ID</span>
            <div className="font-mono font-medium text-primary-text">{agent.id}</div>
          </div>

          <div className="space-y-1">
            <span className="text-muted-text font-mono text-[11px] uppercase">Status</span>
            <div className="text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Verified
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted-text font-mono text-[11px] uppercase">Created</span>
            <div className="text-primary-text font-medium">{agent.createdDate}</div>
          </div>

          <div className="space-y-1">
            <span className="text-muted-text font-mono text-[11px] uppercase">Runtime Version</span>
            <div className="font-mono text-primary-text font-medium">{agent.version}</div>
          </div>
        </div>

        {/* Fingerprint block */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Cryptographic Fingerprint
            </span>
            <button
              onClick={handleCopyFingerprint}
              className="flex items-center gap-1 text-[11px] text-muted-text hover:text-primary-text font-mono transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy key</span>
            </button>
          </div>

          <div className="p-4 rounded border border-border bg-secondary-surface flex items-center justify-between font-mono text-sm">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-secondary-text" />
              <span className="tracking-widest text-primary-text font-semibold">
                {agent.fingerprint}
              </span>
            </div>
            <span className="text-[11px] text-muted-text">SHA-256 ECDSA</span>
          </div>
          <p className="text-[11px] text-muted-text mt-2">
            Every autonomous customer output is stamped with this cryptographic signature.
          </p>
        </div>
      </Card>
    </div>
  );
}
