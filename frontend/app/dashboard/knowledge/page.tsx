"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { SourceCard } from "@/components/knowledge/source-card";
import { CrawlerProgress } from "@/components/knowledge/crawler-progress";
import { AddSourceModal } from "@/components/knowledge/add-source-modal";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useAgentForge, KnowledgeSource } from "@/lib/mock-data";
import { Plus, Database, Search, FileText } from "lucide-react";

export default function KnowledgePage() {
  const { sources, businessBrain } = useAgentForge();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showCrawler, setShowCrawler] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectSource, setInspectSource] = useState<KnowledgeSource | null>(null);

  const filteredSources = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header matching PRD Section 19 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
              Knowledge
            </h1>
            <span className="text-xs font-mono text-muted-text">
              {sources.length} sources
            </span>
            <span className="text-border">•</span>
            <StatusIndicator status="Synced" showText />
          </div>
          <p className="text-xs text-secondary-text">
            Indexed documentation, policies, and files used to ground agent answers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add source
          </Button>
        </div>
      </div>

      {/* Interactive Crawler Progress State (PRD Section 20) */}
      {showCrawler && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Active Sync Worker
            </span>
            <button
              onClick={() => setShowCrawler(false)}
              className="text-[11px] text-muted-text hover:text-secondary-text"
            >
              Dismiss
            </button>
          </div>
          <CrawlerProgress
            initialProgress={62}
            totalPages={228}
            url={businessBrain.website || "https://acme.com"}
          />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-text" />
          <input
            type="text"
            placeholder="Search indexed sources by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded bg-surface border border-border text-xs text-primary-text placeholder:text-muted-text focus:outline-none focus:border-primary-text"
          />
        </div>
      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <EmptyState
          icon={<Database className="w-8 h-8 text-muted-text" />}
          title="Your agent doesn't know anything yet."
          description="Connect your website or add your first knowledge source to get started."
          actionLabel="Add knowledge"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onOpen={(src) => setInspectSource(src)}
            />
          ))}
        </div>
      )}

      {/* Inspect Source Modal */}
      <Modal
        isOpen={!!inspectSource}
        onClose={() => setInspectSource(null)}
        title={inspectSource?.title}
        description={`Identifier: ${inspectSource?.identifier}`}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-3 rounded bg-secondary-surface border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-secondary-text">Type:</span>
              <span className="font-mono text-primary-text uppercase">{inspectSource?.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-text">Status:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {inspectSource?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-text">Parsed Entities:</span>
              <span className="font-mono">{inspectSource?.pagesCount} pages</span>
            </div>
          </div>

          <div>
            <span className="text-secondary-text font-medium block mb-1">Extracted Summary:</span>
            <p className="text-secondary-text leading-relaxed">
              {inspectSource?.description ||
                "This document was parsed into vector chunks and verified for factual fidelity against Acme's core business knowledge graph."}
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={() => setInspectSource(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
