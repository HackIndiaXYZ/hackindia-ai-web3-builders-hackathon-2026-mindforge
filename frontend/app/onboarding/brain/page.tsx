"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { useAgentForge } from "@/lib/mock-data";
import { ArrowRight, ArrowLeft, Edit3, Check, Sparkles, Building, Clock, ShieldCheck, Tag } from "lucide-react";
import { ConfigurationPulse } from "@/components/agent/configuration-pulse";

export default function OnboardingBrainPage() {
  const router = useRouter();
  const { businessBrain, updateBrain, isPulseActive } = useAgentForge();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: businessBrain.companyName,
    industry: businessBrain.industry,
    description: businessBrain.description,
    refundPolicy: businessBrain.policies.refundPolicy,
    shippingPolicy: businessBrain.policies.shippingPolicy,
    supportHours: businessBrain.policies.supportHours,
  });

  const handleSave = () => {
    updateBrain({
      companyName: formData.companyName,
      industry: formData.industry,
      description: formData.description,
      policies: {
        refundPolicy: formData.refundPolicy,
        shippingPolicy: formData.shippingPolicy,
        supportHours: formData.supportHours,
      },
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
            <span>Step 04 • Operational Brain</span>
            <ConfigurationPulse isActive={isPulseActive} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
            Synthesized Business Brain
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
            Your agent's deterministic understanding of your business operations, verified against crawled documentation and operational interview answers.
          </p>
        </div>

        <Button
          size="md"
          variant="secondary"
          onClick={() => setIsEditing(true)}
          className="shadow-subtle cursor-pointer self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4 mr-1.5" />
          <span>Edit Brain Data</span>
        </Button>
      </div>

      {/* Spacious Multi-Column Executive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Business Identity & Overview */}
        <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface shadow-subtle flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                  Business Identity
                </span>
              </div>
              <Badge variant="ai" size="sm">
                Deterministic Model
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3 rounded-lg bg-secondary-surface/40 border border-border">
                <span className="text-muted-text font-mono text-[11px] block">Company Name:</span>
                <span className="font-semibold text-primary-text text-sm">{businessBrain.companyName}</span>
              </div>
              <div className="p-3 rounded-lg bg-secondary-surface/40 border border-border">
                <span className="text-muted-text font-mono text-[11px] block">Industry:</span>
                <span className="font-semibold text-primary-text text-sm">{businessBrain.industry}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-mono text-muted-text uppercase block">Company Scope</span>
              <p className="text-xs text-secondary-text leading-relaxed p-3.5 rounded-lg bg-secondary-surface/30 border border-border">
                {businessBrain.description}
              </p>
            </div>
          </div>

          <div className="pt-2 text-[11px] font-mono text-muted-text flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>Identity synced with vector RAG baseline</span>
          </div>
        </div>

        {/* Card 2: Operating Policies & Hours */}
        <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface shadow-subtle flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                  Operational Policies
                </span>
              </div>
              <span className="text-xs font-mono text-muted-text">3 Policies</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-secondary-surface/40 border border-border space-y-1">
                <span className="font-semibold text-primary-text block font-mono text-[11px]">
                  Refund & Cancellation Policy
                </span>
                <p className="text-secondary-text leading-relaxed">
                  {businessBrain.policies.refundPolicy}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-secondary-surface/40 border border-border space-y-1">
                <span className="font-semibold text-primary-text block font-mono text-[11px]">
                  Fulfillment & Delivery
                </span>
                <p className="text-secondary-text leading-relaxed">
                  {businessBrain.policies.shippingPolicy}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-secondary-surface/40 border border-border space-y-1">
                <span className="font-semibold text-primary-text block font-mono text-[11px]">
                  Standard Operating Hours
                </span>
                <p className="text-secondary-text leading-relaxed">
                  {businessBrain.policies.supportHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Products & Services Catalog */}
        <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                Indexed Offerings & Catalog
              </span>
            </div>
            <span className="text-xs font-mono text-muted-text">
              {businessBrain.services.length} items
            </span>
          </div>

          <p className="text-xs text-secondary-text">
            Customer inquiries regarding these items are answered with direct pricing and feature citations.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {businessBrain.services.map((svc) => (
              <span
                key={svc}
                className="px-3 py-1.5 rounded-lg bg-secondary-surface text-primary-text text-xs border border-border font-medium"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>

        {/* Card 4: Demeanor & Tone Profile */}
        <div className="p-6 sm:p-7 rounded-xl border border-border bg-surface shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                Brand Tone & Demeanor
              </span>
            </div>
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              Active Guardrails
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {businessBrain.tone.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/20 font-medium"
              >
                {trait}
              </span>
            ))}
          </div>

          <p className="text-xs text-secondary-text leading-relaxed p-3.5 rounded-lg bg-secondary-surface/30 border border-border">
            {businessBrain.tone.summary}
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/interview")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Interview</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/actions")}
          className="group shadow-subtle cursor-pointer"
        >
          <span>Continue to Actions</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Business Brain Data">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Textarea
            label="Refund Policy"
            rows={2}
            value={formData.refundPolicy}
            onChange={(e) => setFormData({ ...formData, refundPolicy: e.target.value })}
          />
          <Textarea
            label="Shipping & Fulfillment"
            rows={2}
            value={formData.shippingPolicy}
            onChange={(e) => setFormData({ ...formData, shippingPolicy: e.target.value })}
          />
          <Textarea
            label="Support Hours"
            rows={2}
            value={formData.supportHours}
            onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
