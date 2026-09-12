"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAgentForge } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export default function OnboardingBusinessPage() {
  const router = useRouter();
  const { businessBrain, updateBrain } = useAgentForge();

  const [companyName, setCompanyName] = useState(businessBrain.companyName || "Acme Technologies");
  const [website, setWebsite] = useState(businessBrain.website || "https://acme.com");
  const [industry, setIndustry] = useState(businessBrain.industry || "SaaS");

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

    updateBrain({ companyName, website, industry });
    router.push("/onboarding/sources");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          Tell us about your business
        </h2>
        <p className="text-xs text-secondary-text mt-1.5 leading-relaxed">
          This information helps your agent understand how your business works.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-5 pt-2">
        <Input
          label="Business name"
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
          label="Website"
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

        <Input
          label="Industry"
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            if (errors.industry) setErrors((prev) => ({ ...prev, industry: "" }));
          }}
          placeholder="SaaS"
          error={errors.industry}
          success={!errors.industry && industry.length > 1}
        />

        <div className="pt-4 flex items-center justify-end">
          <Button type="submit" variant="primary" size="lg" className="group">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
