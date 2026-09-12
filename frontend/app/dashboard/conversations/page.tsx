"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Card } from "@/components/ui/card";
import { useAgentForge, ConversationRecord } from "@/lib/mock-data";
import {
  Search,
  MessageSquare,
  FileText,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  Bot,
} from "lucide-react";

export default function ConversationsPage() {
  const { conversations } = useAgentForge();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConv, setSelectedConv] = useState<ConversationRecord>(conversations[0]);

  const filtered = conversations.filter(
    (c) =>
      c.customerNumber.includes(searchQuery) ||
      c.initialQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header per PRD Section 27 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            Conversations
          </h1>
          <p className="text-xs text-secondary-text mt-0.5">
            Audit logs and customer dialogue traces handled by your agent.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-text" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded bg-surface border border-border text-xs text-primary-text placeholder:text-muted-text focus:outline-none focus:border-primary-text"
          />
        </div>
      </div>

      {/* Two-pane Master-Detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px]">
        {/* Left List: Searchable Conversation List (5 Cols) */}
        <div className="lg:col-span-5 border border-border rounded bg-surface overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-border bg-secondary-surface/40 text-xs font-semibold text-secondary-text uppercase tracking-wider">
            Today
          </div>

          <div className="divide-y divide-border/60">
            {filtered.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-4 cursor-pointer transition-colors text-left space-y-1 ${
                    isSelected
                      ? "bg-secondary-surface border-l-2 border-primary-text"
                      : "hover:bg-secondary-surface/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-primary-text">
                      Customer #{conv.customerNumber}
                    </span>
                    <span className="text-[11px] font-mono text-muted-text">{conv.timestamp}</span>
                  </div>

                  <p className="text-xs font-medium text-primary-text truncate">
                    "{conv.initialQuery}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-text truncate max-w-[180px]">
                      {conv.customerName}
                    </span>
                    {conv.status === "resolved" ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Resolved ✓
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Escalated →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane (7 Cols): Conversation details, Resolution, Sources, Actions */}
        <div className="lg:col-span-7 border border-border rounded bg-surface overflow-y-auto p-6 flex flex-col justify-between">
          {selectedConv ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-primary-text">
                      Customer #{selectedConv.customerNumber}
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-xs text-secondary-text">{selectedConv.customerName}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-text">{selectedConv.timestamp}</span>
                </div>

                <div>
                  {selectedConv.status === "resolved" ? (
                    <Badge variant="success">Resolved ✓</Badge>
                  ) : (
                    <Badge variant="warning">Escalated →</Badge>
                  )}
                </div>
              </div>

              {/* Message Transcript */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                  Conversation Transcript
                </span>
                <div className="space-y-3">
                  {selectedConv.messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-secondary-surface border border-border flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3.5 h-3.5 text-primary-text" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded max-w-[85%] ${
                            isUser
                              ? "bg-primary-text text-background"
                              : "bg-secondary-surface text-primary-text border border-border"
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="block text-[10px] opacity-70 mt-1 font-mono">
                            {m.timestamp}
                          </span>
                        </div>
                        {isUser && (
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-primary-text" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata: Sources used, Actions taken, Escalation status */}
              <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-secondary-text uppercase tracking-wider text-[11px] block">
                    Sources used
                  </span>
                  {selectedConv.sourcesUsed.length > 0 ? (
                    <div className="space-y-1">
                      {selectedConv.sourcesUsed.map((src, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-secondary-surface border border-border font-mono text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-secondary-text" />
                          <span>{src}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-text italic">No grounding files referenced</span>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-secondary-text uppercase tracking-wider text-[11px] block">
                    Actions & Tools invoked
                  </span>
                  {selectedConv.actionsTaken.length > 0 ? (
                    <div className="space-y-1">
                      {selectedConv.actionsTaken.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-secondary-surface border border-border font-mono text-[11px]"
                        >
                          <Wrench className="w-3.5 h-3.5 text-secondary-text" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-text italic">Direct knowledge response (No tool invoked)</span>
                  )}
                </div>
              </div>

              {selectedConv.escalationReason && (
                <div className="p-3 rounded border border-amber-500/20 bg-amber-500/5 text-xs">
                  <span className="font-medium text-amber-600 dark:text-amber-400 block mb-0.5">
                    Escalation status
                  </span>
                  <p className="text-secondary-text">{selectedConv.escalationReason}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-text">
              Select a conversation to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
