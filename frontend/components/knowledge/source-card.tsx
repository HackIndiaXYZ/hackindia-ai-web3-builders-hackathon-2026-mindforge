"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIndicator, StatusType } from "@/components/ui/status-indicator";
import { Globe, FileText, File, Sparkles, Trash2, ExternalLink } from "lucide-react";
import { KnowledgeSource, useAgentForge } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/utils";

interface SourceCardProps {
  source: KnowledgeSource;
  onOpen?: (source: KnowledgeSource) => void;
}

export function SourceCard({ source, onOpen }: SourceCardProps) {
  const { removeSource } = useAgentForge();

  const iconMap = {
    website: Globe,
    pdf: FileText,
    document: File,
    manual: Sparkles,
  };

  const IconComponent = iconMap[source.type] || File;

  const statusLabelMap: Record<string, StatusType> = {
    synced: "Synced",
    syncing: "Syncing",
    failed: "Failed",
    indexed: "Published", // green dot
  };

  return (
    <Card hoverable className="flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-secondary-text uppercase tracking-wider">
            <IconComponent className="w-3.5 h-3.5" />
            <span>{source.type}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSource(source.id);
            }}
            className="text-muted-text hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="Remove source"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="text-sm font-medium text-primary-text mt-2 font-mono truncate">
          {source.identifier}
        </h4>
        <p className="text-xs text-secondary-text mt-0.5 truncate">{source.title}</p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <StatusIndicator
            status={statusLabelMap[source.status] || "Synced"}
            showText
            size="sm"
          />
          <span className="font-mono text-muted-text text-[11px]">
            {source.pagesCount} pages
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-text">
        <span>Updated {formatTimeAgo(source.lastUpdatedMinutesAgo)}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs text-primary-text hover:bg-secondary-surface"
          onClick={() => onOpen && onOpen(source)}
        >
          <span>Open</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
