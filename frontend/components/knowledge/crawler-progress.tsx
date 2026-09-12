"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface CrawlerProgressProps {
  initialProgress?: number;
  totalPages?: number;
  url?: string;
  className?: string;
}

export function CrawlerProgress({
  initialProgress = 62,
  totalPages = 228,
  url = "https://acme.com",
  className,
}: CrawlerProgressProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [status, setStatus] = useState<"crawling" | "indexing" | "synced" | "failed">("crawling");

  const currentPages = Math.round((progress / 100) * totalPages);

  useEffect(() => {
    if (status !== "crawling") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setStatus("indexing");
          setTimeout(() => {
            setStatus("synced");
          }, 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className={cn("p-4 rounded border border-border bg-surface space-y-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {status === "crawling" && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
          {status === "indexing" && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
          {status === "synced" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
          {status === "failed" && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
          <span className="font-medium text-primary-text">
            {status === "crawling" && "Crawling website"}
            {status === "indexing" && "Indexing vectors..."}
            {status === "synced" && "Synced successfully"}
            {status === "failed" && "Sync failed"}
          </span>
          <span className="text-muted-text font-mono">({url})</span>
        </div>
        <span className="font-mono text-xs font-medium text-secondary-text">{progress}%</span>
      </div>

      <ProgressBar value={progress} max={100} animated={status === "crawling"} />

      <div className="flex items-center justify-between text-[11px] text-muted-text font-mono">
        <span>
          {currentPages} / {totalPages} pages
        </span>
        <span>
          {status === "crawling" && "Extracting DOM tree & text anchors..."}
          {status === "indexing" && "Building semantic embeddings..."}
          {status === "synced" && "Ready for retrieval"}
        </span>
      </div>
    </div>
  );
}
