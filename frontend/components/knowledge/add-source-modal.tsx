"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, FileText, File, Sparkles } from "lucide-react";
import { useAgentForge } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSourceModal({ isOpen, onClose }: AddSourceModalProps) {
  const [activeTab, setActiveTab] = useState<"website" | "pdf" | "document" | "manual">("website");
  const [title, setTitle] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addSource } = useAgentForge();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addSource({
        type: activeTab,
        title: title || (activeTab === "website" ? identifier : "New Source Document"),
        identifier: identifier,
        status: "synced",
        pagesCount: Math.floor(Math.random() * 40) + 10,
        description: description || "Imported business reference material.",
      });

      setIsSubmitting(false);
      onClose();
      toast(`Added knowledge source: ${title || identifier}`, "success");
      setTitle("");
      setIdentifier("");
      setDescription("");
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Knowledge Source"
      description="Connect business documents, public websites, or operational procedures."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {/* Source Type Selector */}
        <div className="grid grid-cols-4 gap-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("website");
              setIdentifier("https://");
            }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded border text-xs font-medium transition-colors ${
              activeTab === "website"
                ? "border-primary-text bg-secondary-surface text-primary-text"
                : "border-border bg-transparent text-secondary-text hover:bg-secondary-surface"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("pdf");
              setIdentifier("Operations_Manual.pdf");
            }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded border text-xs font-medium transition-colors ${
              activeTab === "pdf"
                ? "border-primary-text bg-secondary-surface text-primary-text"
                : "border-border bg-transparent text-secondary-text hover:bg-secondary-surface"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("document");
              setIdentifier("Policy_Spec.docx");
            }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded border text-xs font-medium transition-colors ${
              activeTab === "document"
                ? "border-primary-text bg-secondary-surface text-primary-text"
                : "border-border bg-transparent text-secondary-text hover:bg-secondary-surface"
            }`}
          >
            <File className="w-4 h-4" />
            <span>Document</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setIdentifier("support/cancellation-policy");
            }}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded border text-xs font-medium transition-colors ${
              activeTab === "manual"
                ? "border-primary-text bg-secondary-surface text-primary-text"
                : "border-border bg-transparent text-secondary-text hover:bg-secondary-surface"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Manual Fact</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Source Title / Label"
            placeholder={
              activeTab === "website"
                ? "Company Marketing Site"
                : activeTab === "pdf"
                ? "Pricing Guide 2026.pdf"
                : "Support Guidelines"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label={
              activeTab === "website"
                ? "Website URL"
                : activeTab === "manual"
                ? "Topic Key / Identifier"
                : "File Path or Mock Upload"
            }
            placeholder={activeTab === "website" ? "https://acme.com/help" : "Guide.pdf"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <Textarea
            label="Description / Context (Optional)"
            placeholder="Specify what this source covers (e.g. refund limits, SLA policies)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add Source
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
