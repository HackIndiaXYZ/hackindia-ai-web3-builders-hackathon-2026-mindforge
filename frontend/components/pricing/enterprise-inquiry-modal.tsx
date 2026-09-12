"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  CheckCircle2,
  Shield,
  Instagram,
  Facebook,
  Database,
  Lock,
  ArrowRight,
  Send,
} from "lucide-react";

interface EnterpriseInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVolume?: number;
}

export function EnterpriseInquiryModal({
  isOpen,
  onClose,
  defaultVolume = 25000,
}: EnterpriseInquiryModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [channels, setChannels] = useState({
    instagram: true,
    facebook: true,
    database: true,
    encryptedVault: true,
  });
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate brief network submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-surface border border-border w-full max-w-xl rounded-xl shadow-elevated overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-secondary-surface/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Enterprise Pay-As-You-Go
              </span>
              <Badge variant="outline" size="sm">
                Custom Architecture
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-primary-text tracking-tight">
              Configure Your Private AI Employee
            </h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Full private end-to-end encryption, social channel automations, and custom database sync.
            </p>
          </div>

          <button
            onClick={handleResetAndClose}
            aria-label="Close modal"
            className="p-1 rounded text-muted-text hover:text-primary-text hover:bg-secondary-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-primary-text">
                  Inquiry Received!
                </h3>
                <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-primary-text">{businessName || "Partner"}</span>.
                  Our enterprise solutions architect has received your channel requirements and will reach out to{" "}
                  <span className="font-mono text-primary-text">{workEmail}</span> within 4 business hours to provision your dedicated sandbox.
                </p>
              </div>

              <div className="pt-4">
                <Button size="md" variant="primary" onClick={handleResetAndClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected Automations Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-primary-text uppercase tracking-wider font-mono block">
                  Select Required Enterprise Capabilities
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Instagram */}
                  <div
                    onClick={() => toggleChannel("instagram")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      channels.instagram
                        ? "border-emerald-500/40 bg-emerald-500/5 text-primary-text"
                        : "border-border bg-secondary-surface/40 text-secondary-text opacity-70"
                    }`}
                  >
                    <Instagram className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Instagram Automation</div>
                      <div className="text-[11px] text-secondary-text">Auto DMs, story mentions, comment replies</div>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div
                    onClick={() => toggleChannel("facebook")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      channels.facebook
                        ? "border-emerald-500/40 bg-emerald-500/5 text-primary-text"
                        : "border-border bg-secondary-surface/40 text-secondary-text opacity-70"
                    }`}
                  >
                    <Facebook className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Facebook Automation</div>
                      <div className="text-[11px] text-secondary-text">Messenger inbox & wall comment sync</div>
                    </div>
                  </div>

                  {/* Database */}
                  <div
                    onClick={() => toggleChannel("database")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      channels.database
                        ? "border-emerald-500/40 bg-emerald-500/5 text-primary-text"
                        : "border-border bg-secondary-surface/40 text-secondary-text opacity-70"
                    }`}
                  >
                    <Database className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Live Database Connector</div>
                      <div className="text-[11px] text-secondary-text">Real-time SQL / Postgres / Supabase sync</div>
                    </div>
                  </div>

                  {/* E2E Encryption */}
                  <div
                    onClick={() => toggleChannel("encryptedVault")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      channels.encryptedVault
                        ? "border-emerald-500/40 bg-emerald-500/5 text-primary-text"
                        : "border-border bg-secondary-surface/40 text-secondary-text opacity-70"
                    }`}
                  >
                    <Lock className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">E2E Encrypted Employee</div>
                      <div className="text-[11px] text-secondary-text">Zero-retention VPC & private memory vault</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-secondary-text">Business Name</label>
                  <Input
                    required
                    placeholder="e.g. Acme Global, Inc."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-secondary-text">Work Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="alex@acme.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-secondary-text">Website or Catalog URL</label>
                <Input
                  placeholder="https://acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-secondary-text">
                  Specific Workflows & Custom Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-md border border-border bg-background text-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text"
                  placeholder="Tell us about your expected conversation volume, custom CRM needs, or security specs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-text flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  NDA & zero-data-retention guarantee
                </span>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleResetAndClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Submit Enterprise Brief</span>
                        <Send className="w-3.5 h-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
