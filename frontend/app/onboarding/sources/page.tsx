"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrawlerProgress } from "@/components/knowledge/crawler-progress";
import { useAgentForge } from "@/lib/mock-data";
import {
  Globe,
  FileText,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";

export default function OnboardingSourcesPage() {
  const router = useRouter();
  const { businessBrain, sources } = useAgentForge();

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary-surface text-xs text-secondary-text mb-2 font-mono">
          <span>Step 02 • Vector RAG Ingestion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-primary-text tracking-tight">
          Connect Knowledge Sources & Documents
        </h1>
        <p className="text-xs sm:text-sm text-secondary-text mt-1.5 max-w-2xl leading-relaxed">
          AgentForge automatically crawls your website and indexes operating policies, service agreements, and FAQs into vector embeddings for grounded AI reasoning.
        </p>
      </div>

      {/* Spacious 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deep Web Crawler Progress & Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-primary-text">
                  Automated Website Crawler
                </span>
              </div>
              <Badge variant="ai" size="sm">
                Recursive Sitemap Crawl
              </Badge>
            </div>

            {/* Active Crawler Component */}
            <CrawlerProgress
              initialProgress={84}
              totalPages={142}
              url={businessBrain.website || "https://acme.com"}
            />

            {/* Live Crawled Pages Stream */}
            <div className="space-y-2 pt-2 border-t border-border/70">
              <span className="text-xs font-semibold text-secondary-text font-mono uppercase tracking-wider block">
                Recently Extracted Endpoints
              </span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2.5 rounded-md bg-secondary-surface/60 border border-border flex items-center justify-between text-secondary-text">
                  <span className="truncate max-w-[280px]">/pricing • Tier comparison & seat limits</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">32 chunks</span>
                </div>
                <div className="p-2.5 rounded-md bg-secondary-surface/60 border border-border flex items-center justify-between text-secondary-text">
                  <span className="truncate max-w-[280px]">/terms • 30-day refund & cancellation window</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">18 chunks</span>
                </div>
                <div className="p-2.5 rounded-md bg-secondary-surface/60 border border-border flex items-center justify-between text-secondary-text">
                  <span className="truncate max-w-[280px]">/contact • Standard 9 AM–6 PM hours & support SLA</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">14 chunks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Indexed Documents & Upload Dropzone */}
        <div className="lg:col-span-5 space-y-6">
          {/* Indexed Documents List */}
          <div className="bg-surface border border-border rounded-xl shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                Indexed Documents & PDFs
              </span>
              <span className="text-[11px] font-mono text-muted-text">
                {sources.length} sources
              </span>
            </div>

            <div className="space-y-2.5">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="p-3.5 rounded-lg border border-border bg-secondary-surface/40 flex items-center justify-between gap-3 transition-colors hover:border-muted-text/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-surface border border-border flex-shrink-0">
                      <FileText className="w-4 h-4 text-secondary-text" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-primary-text truncate max-w-[190px]">
                        {src.title}
                      </p>
                      <p className="text-[11px] text-muted-text font-mono">
                        {src.pagesCount} pages • {src.lastUpdatedMinutesAgo}m ago
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                    Indexed
                  </Badge>
                </div>
              ))}
            </div>

            {/* Drag and Drop Zone */}
            <div className="border border-dashed border-border rounded-xl p-5 text-center space-y-2 hover:border-primary-text/40 transition-colors bg-secondary-surface/20 cursor-pointer">
              <UploadCloud className="w-6 h-6 text-muted-text mx-auto" />
              <div className="text-xs font-medium text-primary-text">Upload additional business docs</div>
              <p className="text-[11px] text-muted-text">
                Drag and drop PDF, DOCX, or CSV files (up to 25MB)
              </p>
            </div>
          </div>

          {/* Embedding Architecture Metrics */}
          <div className="p-5 rounded-xl border border-border bg-secondary-surface/40 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-text font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vector RAG Architecture</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-secondary-text pt-1">
              <div>
                <span className="text-muted-text block">Dimension:</span>
                <span className="font-semibold text-primary-text">384 (all-MiniLM)</span>
              </div>
              <div>
                <span className="text-muted-text block">Chunk Strategy:</span>
                <span className="font-semibold text-primary-text">512 tokens + 10% overlap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 flex items-center justify-between border-t border-border">
        <Button
          variant="ghost"
          size="md"
          onClick={() => router.push("/onboarding/business")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Business</span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/onboarding/interview")}
          className="group shadow-subtle cursor-pointer"
        >
          <span>Continue to Interview</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
