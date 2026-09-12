"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfigurationPulse } from "@/components/agent/configuration-pulse";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { Edit2, Plus, Sparkles, Building2, Layers, Shield, MessageCircle } from "lucide-react";

export default function BusinessBrainPage() {
  const { businessBrain, updateBrain, isPulseActive } = useAgentForge();
  const { toast } = useToast();

  const [activeModal, setActiveModal] = useState<"profile" | "services" | "policies" | "tone" | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState(businessBrain.companyName);
  const [industry, setIndustry] = useState(businessBrain.industry);
  const [description, setDescription] = useState(businessBrain.description);
  const [refundPolicy, setRefundPolicy] = useState(businessBrain.policies.refundPolicy);
  const [shippingPolicy, setShippingPolicy] = useState(businessBrain.policies.shippingPolicy);
  const [supportHours, setSupportHours] = useState(businessBrain.policies.supportHours);
  const [servicesList, setServicesList] = useState(businessBrain.services.join(", "));
  const [toneTraits, setToneTraits] = useState(businessBrain.tone.traits.join(", "));
  const [toneSummary, setToneSummary] = useState(businessBrain.tone.summary);

  const handleSaveProfile = () => {
    updateBrain({ companyName, industry, description });
    setActiveModal(null);
    toast("Business Profile updated & grounded", "success");
  };

  const handleSavePolicies = () => {
    updateBrain({
      policies: {
        refundPolicy,
        shippingPolicy,
        supportHours,
      },
    });
    setActiveModal(null);
    toast("Operating policies updated & grounded", "success");
  };

  const handleSaveServices = () => {
    const list = servicesList.split(",").map((s) => s.trim()).filter(Boolean);
    updateBrain({ services: list });
    setActiveModal(null);
    toast("Services list updated & grounded", "success");
  };

  const handleSaveTone = () => {
    const traits = toneTraits.split(",").map((s) => s.trim()).filter(Boolean);
    updateBrain({
      tone: {
        traits,
        summary: toneSummary,
      },
    });
    setActiveModal(null);
    toast("Agent demeanor updated & grounded", "success");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header section with PRD exact naming and pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="ai">✦ AI generated</Badge>
            <ConfigurationPulse isActive={isPulseActive} label="Knowledge Grounded" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            Business Brain
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Your agent's extracted understanding of your business operations and policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setActiveModal("profile")}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Review & Edit
          </Button>
        </div>
      </div>

      {/* Grid of Brain Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* Section 1: Business Profile */}
        <Card hoverable className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-text" />
              <CardTitle>Business Profile</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="ai" size="sm">✦ AI generated</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setActiveModal("profile")}
              >
                Review
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded bg-secondary-surface/40 border border-border">
              <span className="text-muted-text block mb-1 font-mono text-[11px] uppercase">Company</span>
              <span className="font-semibold text-primary-text">{businessBrain.companyName}</span>
            </div>
            <div className="p-3 rounded bg-secondary-surface/40 border border-border">
              <span className="text-muted-text block mb-1 font-mono text-[11px] uppercase">Industry</span>
              <span className="font-semibold text-primary-text">{businessBrain.industry}</span>
            </div>
            <div className="p-3 rounded bg-secondary-surface/40 border border-border">
              <span className="text-muted-text block mb-1 font-mono text-[11px] uppercase">Primary URL</span>
              <span className="font-mono text-primary-text truncate block">{businessBrain.website}</span>
            </div>
          </div>

          <div className="p-3.5 rounded bg-secondary-surface/40 border border-border text-xs space-y-1">
            <span className="text-muted-text block font-mono text-[11px] uppercase">Description</span>
            <p className="text-secondary-text leading-relaxed">{businessBrain.description}</p>
          </div>
        </Card>

        {/* Section 2: Services */}
        <Card hoverable className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-text" />
              <CardTitle>Services & Offerings</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="ai" size="sm">✦ AI generated</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setActiveModal("services")}
              >
                Review
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {businessBrain.services.map((service) => (
              <div
                key={service}
                className="px-3 py-1.5 rounded border border-border bg-secondary-surface text-xs font-medium text-primary-text flex items-center gap-2"
              >
                <span>{service}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Operating Policies */}
        <Card hoverable className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-text" />
              <CardTitle>Policies & Guarantees</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="ai" size="sm">✦ AI generated</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setActiveModal("policies")}
              >
                Review
              </Button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded bg-secondary-surface/40 border border-border">
              <span className="font-semibold text-primary-text block mb-1">Refund policy</span>
              <p className="text-secondary-text leading-relaxed">
                {businessBrain.policies.refundPolicy}
              </p>
            </div>

            <div className="p-3.5 rounded bg-secondary-surface/40 border border-border">
              <span className="font-semibold text-primary-text block mb-1">Shipping & Delivery policy</span>
              <p className="text-secondary-text leading-relaxed">
                {businessBrain.policies.shippingPolicy}
              </p>
            </div>

            <div className="p-3.5 rounded bg-secondary-surface/40 border border-border">
              <span className="font-semibold text-primary-text block mb-1">Support hours</span>
              <p className="text-secondary-text leading-relaxed">
                {businessBrain.policies.supportHours}
              </p>
            </div>
          </div>
        </Card>

        {/* Section 4: Tone */}
        <Card hoverable className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary-text" />
              <CardTitle>Tone & Demeanor</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="ai" size="sm">✦ AI generated</Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setActiveModal("tone")}
              >
                Review
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {businessBrain.tone.traits.map((trait) => (
              <span
                key={trait}
                className="px-2.5 py-1 rounded bg-secondary-surface border border-border text-xs font-medium text-primary-text"
              >
                {trait}
              </span>
            ))}
          </div>

          <p className="text-xs text-secondary-text leading-relaxed">
            {businessBrain.tone.summary}
          </p>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={activeModal === "profile"}
        onClose={() => setActiveModal(null)}
        title="Edit Business Profile"
        description="Edit the synthesized company foundation details."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Policies Modal */}
      <Modal
        isOpen={activeModal === "policies"}
        onClose={() => setActiveModal(null)}
        title="Edit Operating Policies"
        description="Specify exact rules for refunds, deliveries, and SLAs."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            label="Refund Policy"
            value={refundPolicy}
            onChange={(e) => setRefundPolicy(e.target.value)}
          />
          <Textarea
            label="Shipping & Provisioning Policy"
            value={shippingPolicy}
            onChange={(e) => setShippingPolicy(e.target.value)}
          />
          <Textarea
            label="Support Operating Hours"
            value={supportHours}
            onChange={(e) => setSupportHours(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSavePolicies}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Services Modal */}
      <Modal
        isOpen={activeModal === "services"}
        onClose={() => setActiveModal(null)}
        title="Edit Services"
        description="Comma-separated list of commercial offerings."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Services (comma-separated)"
            value={servicesList}
            onChange={(e) => setServicesList(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveServices}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Tone Modal */}
      <Modal
        isOpen={activeModal === "tone"}
        onClose={() => setActiveModal(null)}
        title="Edit Tone"
        description="Define agent communication style and demeanor."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Tone Traits (comma-separated)"
            value={toneTraits}
            onChange={(e) => setToneTraits(e.target.value)}
          />
          <Textarea
            label="Tone Summary"
            value={toneSummary}
            onChange={(e) => setToneSummary(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveTone}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
