"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { Check, Edit3, Shield, ChevronDown, ChevronUp } from "lucide-react";

export default function InstructionsPage() {
  const { instructions, updateInstructions } = useAgentForge();
  const { toast } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Drawer form state
  const [roleInput, setRoleInput] = useState(instructions.roleStatement);
  const [rulesInput, setRulesInput] = useState(instructions.rules.join("\n"));
  const [promptInput, setPromptInput] = useState(instructions.advancedSystemPrompt);

  const handleSave = () => {
    const parsedRules = rulesInput
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    updateInstructions(parsedRules, roleInput);
    setDrawerOpen(false);
    toast("Instructions and guardrails updated", "success");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            Instructions
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            How your agent should behave in customer interactions.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setRoleInput(instructions.roleStatement);
            setRulesInput(instructions.rules.join("\n"));
            setPromptInput(instructions.advancedSystemPrompt);
            setDrawerOpen(true);
          }}
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Edit instructions
        </Button>
      </div>

      {/* Starter Plan Inclusions Banner */}
      <div className="p-3.5 rounded-lg border border-border bg-secondary-surface/40 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-secondary-text">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span>
            <strong className="text-primary-text font-medium">Included in Starter Plan:</strong> Instruct your AI on what to say to customers, brand tone traits, refund guidelines, and negative safety constraints.
          </span>
        </div>
        <Badge variant="neutral" size="sm" className="hidden sm:inline-flex">
          Starter • $0
        </Badge>
      </div>

      {/* Main Instructions Cards matching PRD Section 22 */}
      <div className="space-y-6">
        {/* Role */}
        <Card hoverable className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Role
          </span>
          <p className="text-sm font-medium text-primary-text leading-relaxed">
            {instructions.roleStatement}
          </p>
        </Card>

        {/* Tone */}
        <Card hoverable className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Tone
          </span>
          <div className="flex items-center gap-2">
            {instructions.toneAttributes.map((tone) => (
              <span
                key={tone}
                className="px-2.5 py-1 rounded bg-secondary-surface border border-border text-xs font-medium text-primary-text"
              >
                {tone}
              </span>
            ))}
          </div>
        </Card>

        {/* Rules */}
        <Card hoverable className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Rules & Safety Guardrails
          </span>
          <div className="space-y-2.5">
            {instructions.rules.map((rule) => (
              <div key={rule} className="flex items-center gap-2.5 text-xs text-primary-text">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Progressive disclosure: Advanced configuration hidden by default */}
        <div className="pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary-text font-medium select-none"
          >
            <span>Advanced runtime directives</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded border border-border bg-secondary-surface/50 text-xs space-y-2 font-mono text-secondary-text">
              <span className="text-[11px] uppercase tracking-wider text-muted-text font-semibold block font-sans">
                Runtime System Prompt Override
              </span>
              <p className="leading-relaxed whitespace-pre-wrap">{instructions.advancedSystemPrompt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Agent Instructions"
        description="Update role definitions, tone, and operational rules."
        width="md"
      >
        <div className="space-y-5 pt-2">
          <Textarea
            label="Role Statement"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
          />

          <Textarea
            label="Rules (one per line)"
            rows={5}
            value={rulesInput}
            onChange={(e) => setRulesInput(e.target.value)}
            hint="Prefixed with ✓ checkmarks in the agent's behavior manifest."
          />

          <div className="pt-2 border-t border-border">
            <label className="text-xs font-medium text-secondary-text block mb-1">
              Advanced Directives
            </label>
            <textarea
              className="w-full h-24 p-2.5 rounded bg-secondary-surface border border-border text-xs font-mono text-primary-text focus:outline-none focus:border-primary-text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Instructions
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
