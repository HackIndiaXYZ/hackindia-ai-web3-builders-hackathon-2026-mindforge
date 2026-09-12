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
import { ArrowRight, ArrowLeft, Edit3, Check } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ai">AI generated</Badge>
            <ConfigurationPulse isActive={isPulseActive} />
          </div>
          <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
            Business Brain
          </h2>
          <p className="text-xs text-secondary-text mt-1">
            Your agent's extracted understanding of your business operations.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing(true)}
          className="text-xs"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Review & Edit
        </Button>
      </div>

      <div className="space-y-4 pt-1">
        {/* Business Profile */}
        <Card className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Business Profile
          </span>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-text block">Company</span>
              <span className="font-medium text-primary-text">{businessBrain.companyName}</span>
            </div>
            <div>
              <span className="text-muted-text block">Industry</span>
              <span className="font-medium text-primary-text">{businessBrain.industry}</span>
            </div>
          </div>
          <div className="text-xs pt-1 border-t border-border/60">
            <span className="text-muted-text block mb-0.5">Description</span>
            <p className="text-secondary-text leading-relaxed">{businessBrain.description}</p>
          </div>
        </Card>

        {/* Services & Offerings */}
        <Card className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Services
          </span>
          <div className="flex flex-wrap gap-2">
            {businessBrain.services.map((svc) => (
              <span
                key={svc}
                className="px-2.5 py-1 rounded bg-secondary-surface text-primary-text text-xs border border-border"
              >
                {svc}
              </span>
            ))}
          </div>
        </Card>

        {/* Operating Policies */}
        <Card className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Policies
          </span>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="font-medium text-primary-text block">Refund Policy</span>
              <p className="text-secondary-text mt-0.5 leading-relaxed">
                {businessBrain.policies.refundPolicy}
              </p>
            </div>
            <div>
              <span className="font-medium text-primary-text block">Shipping & Delivery</span>
              <p className="text-secondary-text mt-0.5 leading-relaxed">
                {businessBrain.policies.shippingPolicy}
              </p>
            </div>
            <div>
              <span className="font-medium text-primary-text block">Support Hours</span>
              <p className="text-secondary-text mt-0.5 leading-relaxed">
                {businessBrain.policies.supportHours}
              </p>
            </div>
          </div>
        </Card>

        {/* Demeanor / Tone */}
        <Card className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Tone
          </span>
          <div className="flex items-center gap-2">
            {businessBrain.tone.traits.map((trait) => (
              <Badge key={trait} variant="neutral">
                {trait}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-secondary-text mt-1 leading-relaxed">
            {businessBrain.tone.summary}
          </p>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Review & Edit Business Brain"
        description="Modify synthesized policies and company background."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Textarea
            label="Refund Policy"
            value={formData.refundPolicy}
            onChange={(e) => setFormData({ ...formData, refundPolicy: e.target.value })}
          />
          <Textarea
            label="Support Hours"
            value={formData.supportHours}
            onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save & Ground
            </Button>
          </div>
        </div>
      </Modal>

      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button variant="ghost" size="md" onClick={() => router.push("/onboarding/interview")}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/actions")}
          className="group"
        >
          <span>Configure Actions</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
