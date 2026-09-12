"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CrawlerProgress } from "@/components/knowledge/crawler-progress";
import { useAgentForge } from "@/lib/mock-data";
import { Globe, FileText, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingSourcesPage() {
  const router = useRouter();
  const { businessBrain } = useAgentForge();
  const [crawlComplete, setCrawlComplete] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
          Connect Knowledge Sources
        </h2>
        <p className="text-xs text-secondary-text mt-1.5 leading-relaxed">
          AgentForge automatically indexes your public documentation, service agreements, and pricing.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Active Crawler Simulator */}
        <CrawlerProgress
          initialProgress={62}
          totalPages={228}
          url={businessBrain.website || "https://acme.com"}
        />

        {/* Existing indexed documents */}
        <div className="p-3.5 rounded border border-border bg-secondary-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-surface border border-border">
              <FileText className="w-4 h-4 text-secondary-text" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary-text">Pricing & SLA Guide.pdf</p>
              <p className="text-[11px] text-muted-text">32 pages • Auto-parsed from domain</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            Indexed
          </span>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/business")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/interview")}
          className="group"
        >
          <span>Continue to Interview</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
