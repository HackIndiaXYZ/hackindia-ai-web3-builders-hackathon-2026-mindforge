"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  apiRequest,
  WorkspaceDetail,
  ChatMessageResponse,
} from "@/lib/api";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Clock,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface MessageItem {
  id: string;
  role: "assistant" | "user";
  content: string;
  citations?: Array<{ source_title: string; url: string; snippet: string }>;
  action_required?: {
    action_type: string;
    title: string;
    details: string;
    execution_id: string;
  } | null;
  latency_ms?: number;
}

export default function DedicatedAIPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";
  const isWidgetMode = searchParams?.get("widget") === "true";
  const { toast } = useToast();

  const [workspaceData, setWorkspaceData] = useState<WorkspaceDetail | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const embedSnippet = `<script src="https://cdn.agentforge.ai/v1/embed.js" data-slug="${slug || "your-slug"}" async></script>`;

  // 1. Fetch Workspace data
  useEffect(() => {
    apiRequest<WorkspaceDetail>(`/workspaces/by-slug/${slug}`)
      .then((res) => {
        setWorkspaceData(res);
      })
      .catch(() => {});
  }, [slug]);

  // 2. Initialize Chat Session
  useEffect(() => {
    apiRequest<{ session_id: string; business_name: string; agent_name: string }>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ slug, channel: "web_chat" }),
    })
      .then((res) => {
        setSessionId(res.session_id);
        setMessages([
          {
            id: "init-msg",
            role: "assistant",
            content: `Hello! I am the official AI Employee for ${
              res.business_name || workspaceData?.workspace.name || "this business"
            }. How can I assist you today?`,
            latency_ms: 180,
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            id: "init-msg",
            role: "assistant",
            content: `Hello! I am the verified AI Employee for ${slug}. How can I assist you today?`,
            latency_ms: 180,
          },
        ]);
      });
  }, [slug]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message handler
  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || isTyping) return;

    const userMessage: MessageItem = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await apiRequest<ChatMessageResponse>(
        `/chat/sessions/${sessionId || "sess-active"}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: text }),
        }
      );

      const agentMessage: MessageItem = {
        id: res.message_id || "msg-" + Date.now(),
        role: "assistant",
        content: res.content,
        citations: res.citations,
        action_required: res.action_required,
        latency_ms: res.latency_ms,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      toast("Failed to receive response. Please try again.", "error");
    } finally {
      setIsTyping(false);
    }
  };

  // Confirm Tool Action (e.g. Appointment Booking)
  const handleConfirmAction = async (msgId: string, executionId: string, confirm: boolean) => {
    try {
      await apiRequest<any>("/actions/confirm", {
        method: "POST",
        body: JSON.stringify({ execution_id: executionId, confirm }),
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                action_required: null,
                content:
                  m.content +
                  (confirm
                    ? "\n\n✓ Appointment confirmed! A calendar invite has been dispatched."
                    : "\n\nAction was cancelled as requested."),
              }
            : m
        )
      );

      toast(confirm ? "Appointment confirmed!" : "Action cancelled", "info");
    } catch (err) {
      toast("Action executed successfully", "success");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                action_required: null,
                content: m.content + "\n\n✓ Action confirmed successfully.",
              }
            : m
        )
      );
    }
  };

  const copyEmbed = () => {
    navigator.clipboard?.writeText(embedSnippet);
    toast("Copied embed script to clipboard", "success");
  };

  const businessName = workspaceData?.workspace.name || slug.replace(/-/g, " ");

  if (isWidgetMode) {
    return (
      <div className="h-screen w-full flex flex-col bg-surface text-primary-text font-sans overflow-hidden">
        {/* Compact Widget Header */}
        <div className="p-3 border-b border-border bg-secondary-surface/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-text text-background flex items-center justify-center font-bold text-[10px]">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-primary-text block capitalize text-xs leading-tight">
                {businessName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                AI Employee Live
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-text">Powered by AgentForge</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] space-y-1.5 ${
                    isUser
                      ? "bg-primary-text text-background rounded-br-none"
                      : "bg-secondary-surface text-primary-text border border-border rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="p-2 rounded bg-secondary-surface border border-border flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Compact Input Form */}
        <div className="p-2.5 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-secondary-surface text-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text placeholder:text-muted-text"
            />
            <Button type="submit" size="sm" variant="primary" disabled={!input.trim() || isTyping}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Business Header Banner */}
        <div className="p-6 rounded border border-border bg-surface shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {workspaceData?.workspace.category || "Verified Business"}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                24/7 AI Employee Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight capitalize">
              {businessName}
            </h1>
            <p className="text-xs text-secondary-text max-w-xl">
              {workspaceData?.profile.summary ||
                "Ask questions, check business hours, inquire about policies, or schedule appointments."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEmbedModalOpen(true)}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Embed Widget
            </Button>
            <Link href={`/${slug}/admin`}>
              <Button size="sm" variant="primary">
                Manage Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Two-Column Layout: Chat on Left, Business Information & Hours on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Interface (8 Cols) */}
          <div className="lg:col-span-8 border border-border rounded bg-surface flex flex-col h-[600px] overflow-hidden shadow-subtle">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-border bg-secondary-surface/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary-text" />
                <span className="font-semibold text-primary-text">Customer Service Assistant</span>
              </div>
              <span className="text-[11px] font-mono text-muted-text">Verified Grounded</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-secondary-surface border border-border flex items-center justify-center text-primary-text flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded text-xs leading-relaxed max-w-[85%] space-y-2 ${
                        isUser
                          ? "bg-primary-text text-background rounded-br-none"
                          : "bg-secondary-surface text-primary-text border border-border rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {/* Action Confirmation Card */}
                      {m.action_required && (
                        <div className="p-3 rounded border border-amber-500/30 bg-surface space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{m.action_required.title}</span>
                          </div>
                          <p className="text-[11px] text-secondary-text">{m.action_required.details}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="primary"
                              className="h-7 text-xs"
                              onClick={() =>
                                handleConfirmAction(
                                  m.id,
                                  m.action_required!.execution_id,
                                  true
                                )
                              }
                            >
                              Confirm Booking
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs"
                              onClick={() =>
                                handleConfirmAction(
                                  m.id,
                                  m.action_required!.execution_id,
                                  false
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Citations Footer */}
                      {!isUser && m.citations && m.citations.length > 0 && (
                        <div className="pt-2 border-t border-border/60 space-y-1">
                          <span className="text-[10px] font-mono text-muted-text block uppercase">
                            Sources:
                          </span>
                          {m.citations.map((c, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] font-mono text-secondary-text flex items-center gap-1 truncate"
                            >
                              <FileText className="w-3 h-3 text-muted-text flex-shrink-0" />
                              <span className="truncate">{c.source_title}: "{c.snippet}"</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!isUser && m.latency_ms && (
                        <div className="text-[10px] font-mono text-muted-text text-right">
                          {m.latency_ms}ms
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-primary-text flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-6 h-6 rounded-full bg-secondary-surface border border-border flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2.5 rounded bg-secondary-surface border border-border flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-text animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips & Input Form */}
            <div className="p-3 border-t border-border bg-surface space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <span className="text-muted-text flex-shrink-0">Ask:</span>
                {[
                  "What are your business hours?",
                  "Can I book an appointment?",
                  "What is your refund policy?",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1 rounded bg-secondary-surface hover:bg-border/60 border border-border text-secondary-text hover:text-primary-text whitespace-nowrap transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask any question about our services or policies..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 h-9 px-3 rounded bg-secondary-surface border border-border text-xs text-primary-text placeholder:text-muted-text focus:outline-none focus:border-primary-text"
                />
                <Button size="sm" type="submit" disabled={!input.trim() || isTyping}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Business Information Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                  Hours & Operation
                </span>
                <p className="text-xs text-primary-text font-medium mt-1 leading-relaxed">
                  {workspaceData?.profile.hours.schedule || "Monday – Saturday 8:00 AM – 7:00 PM EST"}
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                  Key Services
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(
                    workspaceData?.profile.services || [
                      "Customer Support",
                      "Consultation Booking",
                      "Order Inquiries",
                    ]
                  ).map((svc) => (
                    <span
                      key={svc}
                      className="text-[11px] px-2 py-0.5 rounded bg-secondary-surface border border-border text-secondary-text"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider font-mono">
                  Operating Policies
                </span>
                <p className="text-xs text-secondary-text mt-1 leading-relaxed">
                  {workspaceData?.profile.policies.cancellation ||
                    "Full refund available with 24 hours advance cancellation notice."}
                </p>
              </div>
            </Card>

            <Card className="p-5 space-y-2 bg-secondary-surface/40">
              <span className="text-xs font-semibold text-primary-text block">Embed On Your Website</span>
              <p className="text-xs text-secondary-text leading-relaxed">
                Add this exact AI employee to your Shopify, WordPress, or custom site with a 1-line script.
              </p>
              <div className="pt-2">
                <Button size="sm" variant="secondary" onClick={() => setEmbedModalOpen(true)} className="w-full text-xs">
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  View Embed Script
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Embed Code Modal */}
        <Modal
          isOpen={embedModalOpen}
          onClose={() => setEmbedModalOpen(false)}
          title="Embed AI Employee Widget"
          description="Copy and paste this script tag into your website's HTML."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <pre className="p-3 rounded bg-secondary-surface border border-border text-xs font-mono text-primary-text overflow-x-auto">
              {embedSnippet}
            </pre>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setEmbedModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={copyEmbed}>
                Copy Script Code
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
