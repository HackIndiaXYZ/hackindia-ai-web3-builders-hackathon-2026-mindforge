"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentForge } from "@/lib/mock-data";
import { ArrowRight, Globe, Building2, Sparkles, ShieldCheck, Bot, CheckCircle2 } from "lucide-react";

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const { businessBrain, updateBrain } = useAgentForge();

  const [companyName, setCompanyName] = useState(businessBrain.companyName || "");
  const [website, setWebsite] = useState(businessBrain.website || "");
  const [industry, setIndustry] = useState(businessBrain.industry || "");
  const [description, setDescription] = useState(businessBrain.description || "");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!companyName.trim()) {
      newErrors.companyName = "Business name is required";
    }
    if (!website.trim()) {
      newErrors.website = "Website URL is required";
    } else if (!website.startsWith("http://") && !website.startsWith("https://")) {
      newErrors.website = "Must include https:// or http://";
    }
    if (!industry.trim()) {
      newErrors.industry = "Industry sector is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateBrain({ companyName, website, industry, description });
    router.push("/onboarding/sources");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
          <span>Step 01 • Business Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
          Tell Us About Your Business
        </h1>
        <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
          AgentForge uses this foundation to crawl your website, index operating policies, and train your autonomous AI employee to speak on behalf of your brand.
        </p>
      </div>

      {/* Spacious 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-8 space-y-6">
          <form onSubmit={handleContinue} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
                }}
                placeholder="Acme Technologies"
                error={errors.companyName}
                success={!errors.companyName && companyName.length > 2}
              />

              <Input
                label="Industry / Sector"
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  if (errors.industry) setErrors((prev) => ({ ...prev, industry: "" }));
                }}
                placeholder="e.g. Retail, Healthcare, SaaS"
                error={errors.industry}
                success={!errors.industry && industry.length > 1}
              />
            </div>

            <Input
              label="Website or Catalog URL"
              type="url"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                if (errors.website) setErrors((prev) => ({ ...prev, website: "" }));
              }}
              placeholder="https://acme.com"
              error={errors.website}
              success={!errors.website && website.startsWith("http")}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary-text block">
                Business Description & Primary Offerings
              </label>
              <textarea
                rows={3}
                className="w-full text-xs p-3 rounded-lg border border-border bg-background text-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text transition-all leading-relaxed"
                placeholder="Briefly describe what your business sells, key services, and target customer profile..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-[11px] text-muted-text">
                This helps the AI prioritize relevant answers before crawling completes.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <span className="text-xs text-muted-text flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Zero-retention VPC isolation
              </span>

              <Button type="submit" variant="primary" size="lg" className="group shadow-subtle cursor-pointer">
                <span>Continue to Sources</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Live AI Employee Blueprint & Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Agent Card Preview */}
          <div className="p-6 rounded-xl border border-border bg-surface shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                Live Employee Preview
              </span>
              <Badge variant="outline" size="sm" className="font-mono text-[11px]">
                Drafting
              </Badge>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-secondary-surface border border-border flex items-center justify-center text-primary-text flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-primary-text">
                    {companyName || "Your Company"} AI
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs text-secondary-text font-mono">
                  {industry || "General Industry"}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-muted-text">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[200px]">{website || "https://yourbrand.com"}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed border-t border-border/60 pt-3 italic">
              "{description ? description.slice(0, 140) + (description.length > 140 ? "..." : "") : "Autonomous customer support and operations assistant ready to assist clients."}"
            </p>
          </div>

          {/* Autonomous Setup Blueprint */}
          <div className="p-6 rounded-xl border border-border bg-secondary-surface/40 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Onboarding Blueprint
            </h4>

            <div className="space-y-2.5 text-xs text-secondary-text font-mono">
              <div className="flex items-center gap-2 text-primary-text">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>01 Define Business Identity (Active)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-text">
                <span className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center text-[9px]">2</span>
                <span>02 Deep Web Crawler & Document RAG</span>
              </div>
              <div className="flex items-center gap-2 text-muted-text">
                <span className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center text-[9px]">3</span>
                <span>03 Operational Gap Resolution Interview</span>
              </div>
              <div className="flex items-center gap-2 text-muted-text">
                <span className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center text-[9px]">4</span>
                <span>04 Business Brain Synthesis & Testing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
