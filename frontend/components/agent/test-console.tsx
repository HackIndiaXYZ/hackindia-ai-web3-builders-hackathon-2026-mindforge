"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TracePanel, TraceData } from "@/components/agent/trace-panel";
import { Send, Sparkles, User, Bot, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  trace?: TraceData;
}

const PRESET_QUERIES = [
  "What is your refund policy?",
  "Where is my order #ORD-88219?",
  "What are your standard support hours?",
  "Can you deploy a custom nuclear reactor?", // triggers trust state
];

export function TestConsole() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "agent",
      text: "Hello! I am your Acme Support Assistant. I am grounded in your company's knowledge base and operating policies. Ask me a question or choose a prompt below.",
      trace: {
        sources: ["acme.com", "Business Profile"],
        toolCalls: [],
        latencyMs: 120,
        tokensUsed: 42,
        confidence: 99.8,
        isGrounded: true,
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTrace, setActiveTrace] = useState<TraceData | undefined>(messages[0]?.trace);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate intelligent grounded response
    setTimeout(() => {
      let responseText = "";
      let traceData: TraceData;

      const lower = query.toLowerCase();

      if (lower.includes("refund")) {
        responseText =
          "According to Acme's verified refund policy, customers are eligible for a full refund within 30 days for unused billing cycles. Prorated refunds on annual contracts require administrative account review.";
        traceData = {
          sources: ["Pricing & Billing Guide.pdf (p. 4)", "Customer Support Playbook"],
          toolCalls: [
            {
              name: "query_policy_vector",
              params: "{ topic: 'refund_window' }",
              output: "Found 30-day clause in standard terms",
            },
          ],
          latencyMs: 312,
          tokensUsed: 86,
          confidence: 98.6,
          isGrounded: true,
        };
      } else if (lower.includes("order")) {
        responseText =
          "I looked up order #ORD-88219. It has been dispatched via FedEx Priority and is scheduled for delivery tomorrow, Sep 11, by 2:00 PM EST.";
        traceData = {
          sources: ["acme.com/orders", "FedEx Carrier Gateway API"],
          toolCalls: [
            {
              name: "check_order_status",
              params: "{ order_id: 'ORD-88219' }",
              output: "{ status: 'in_transit', carrier: 'fedex' }",
            },
          ],
          latencyMs: 245,
          tokensUsed: 64,
          confidence: 99.2,
          isGrounded: true,
        };
      } else if (lower.includes("support hours") || lower.includes("hours")) {
        responseText =
          "Our standard support operations run Monday through Friday, 9:00 AM to 6:00 PM EST. For critical Tier-1 enterprise emergencies, on-call engineering is available 24/7/365.";
        traceData = {
          sources: ["acme.com/support", "Company Operating Profile"],
          toolCalls: [],
          latencyMs: 180,
          tokensUsed: 52,
          confidence: 99.5,
          isGrounded: true,
        };
      } else if (lower.includes("reactor") || lower.includes("nuclear") || lower.includes("unknown")) {
        // PRD Section 26: Trust State
        responseText =
          "I apologize, but I could not find verified information in Acme's documentation regarding custom nuclear reactor construction. Would you like me to escalate this inquiry to our human engineering lead?";
        traceData = {
          sources: [],
          toolCalls: [
            {
              name: "vector_similarity_search",
              params: "{ query: 'nuclear reactor deployment' }",
              output: "Top score: 0.12 (Below cutoff 0.75)",
            },
          ],
          latencyMs: 195,
          tokensUsed: 44,
          confidence: 12.0,
          isGrounded: false,
          unfoundKnowledge: true,
        };
      } else {
        responseText = `Based on Acme's knowledge base, I can assist with questions regarding: ${query}. Please let me know if you would like me to invoke an authorized workflow or retrieve documentation.`;
        traceData = {
          sources: ["acme.com", "Pricing & Billing Guide.pdf"],
          toolCalls: [],
          latencyMs: 280,
          tokensUsed: 72,
          confidence: 94.2,
          isGrounded: true,
        };
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: "agent",
        text: responseText,
        trace: traceData,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setActiveTrace(traceData);
      setIsTyping(false);
    }, 650);
  };

  const handleEscalate = () => {
    toast("Session escalated to human engineering support", "info");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[560px]">
      {/* Left Column: Customer Chat (7 Cols) */}
      <div className="lg:col-span-7 border border-border rounded bg-surface flex flex-col justify-between overflow-hidden shadow-subtle">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary-surface/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-primary-text">Customer Chat Simulation</span>
          </div>
          <span className="text-[11px] font-mono text-muted-text">Interactive Test</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                onClick={() => m.trace && setActiveTrace(m.trace)}
                className={`flex gap-2.5 cursor-pointer ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-secondary-surface border border-border flex items-center justify-center text-primary-text flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded text-xs leading-relaxed max-w-[85%] ${
                    isUser
                      ? "bg-primary-text text-background rounded-br-none"
                      : "bg-secondary-surface text-primary-text border border-border rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  {!isUser && m.trace && (
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-text font-mono">
                      <span>Click to inspect trace</span>
                      <span>{m.trace.confidence}% conf</span>
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
              <div className="w-6 h-6 rounded-full bg-secondary-surface border border-border flex items-center justify-center text-primary-text flex-shrink-0">
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

        {/* Suggested Queries & Input */}
        <div className="p-3 border-t border-border bg-surface space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <span className="text-muted-text flex-shrink-0">Try:</span>
            {PRESET_QUERIES.map((pq) => (
              <button
                key={pq}
                onClick={() => handleSend(pq)}
                className="px-2 py-1 rounded bg-secondary-surface hover:bg-border/60 border border-border text-secondary-text hover:text-primary-text whitespace-nowrap transition-colors"
              >
                {pq}
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
              placeholder="Ask your agent a question..."
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

      {/* Right Column: "Why this answer?" Grounding Trace (5 Cols) */}
      <div className="lg:col-span-5 h-full">
        <TracePanel trace={activeTrace} onEscalate={handleEscalate} />
      </div>
    </div>
  );
}
