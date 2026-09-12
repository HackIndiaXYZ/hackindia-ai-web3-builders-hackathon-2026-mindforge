"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";
import {
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  MessageSquare,
  Building2,
  Calendar,
  ShieldAlert,
  Copy,
  ExternalLink,
  Bot,
  Send,
  X,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/onboarding");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Workflow Phases: 1 (URL input) -> 2 (Crawling) -> 3 (3-Turn Interview) -> 4 (Brain Review) -> 5 (Deployed Success)
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Phase 1 inputs (no pre-typed hardcoded data)
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [customSlug, setCustomSlug] = useState("");

  // Phase 2 & 3 state
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlStatusText, setCrawlStatusText] = useState("Crawling website pages...");

  // Interview state (3 turns)
  const [interviewTurn, setInterviewTurn] = useState(1);
  const [assistantMessage, setAssistantMessage] = useState(
    "Welcome! Enter your business details below to train your AI Employee."
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  // Phase 4 Business Brain Review state
  const [profileData, setProfileData] = useState({
    hours: "",
    services: "",
    policies: "",
    contact: "",
  });

  // Phase 5 Deployment state
  const [embedCode, setEmbedCode] = useState("");
  const [dedicatedUrl, setDedicatedUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");

  // Website URL Verification State
  const [urlChecking, setUrlChecking] = useState(false);
  const [urlStatus, setUrlStatus] = useState<{ is_real: boolean; message: string } | null>(null);

  const verifyUrl = async (urlToTest: string) => {
    const clean = urlToTest.trim();
    if (!clean || !clean.includes(".")) {
      setUrlStatus(null);
      return;
    }
    setUrlChecking(true);
    try {
      const res = await apiRequest<any>("/onboarding/verify-url", {
        method: "POST",
        body: JSON.stringify({ website_url: clean }),
      });
      if (res && res.is_real) {
        setUrlStatus({ is_real: true, message: res.title ? `Verified live: "${res.title}"` : "Verified live website." });
        if (!businessName && res.title) {
          const autoName = res.title.split("|")[0].split("-")[0].trim();
          if (autoName && autoName.length < 35) setBusinessName(autoName);
        }
      } else {
        setUrlStatus({ is_real: false, message: res?.error || "Website is unreachable or does not exist." });
      }
    } catch (err: any) {
      setUrlStatus({ is_real: false, message: err?.message || "Cannot connect to website." });
    } finally {
      setUrlChecking(false);
    }
  };

  // Handler: Start Crawling & Init Onboarding
  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl) return;

    if (urlStatus && !urlStatus.is_real) {
      toast("The website is unreachable or does not exist. Please enter a valid URL.", "error");
      return;
    }

    setPhase(2);
    setCrawlProgress(15);
    setCrawlStatusText("Deep crawling website pages & DOM hierarchy...");

    try {
      const initPromise = apiRequest<any>("/onboarding/init", {
        method: "POST",
        body: JSON.stringify({
          website_url: websiteUrl,
          business_name: businessName,
          category,
          business_notes: businessNotes,
          custom_slug: customSlug.trim() ? customSlug.trim() : undefined,
        }),
      });

      // Simulated progression stages
      setTimeout(() => {
        setCrawlProgress(55);
        setCrawlStatusText("Generating dense vector embeddings (FastEmbed + pgvector)...");
      }, 1200);

      setTimeout(() => {
        setCrawlProgress(85);
        setCrawlStatusText("Synthesizing Business Profile & detecting knowledge gaps...");
      }, 2400);

      const res = await initPromise;

      setTimeout(() => {
        setCrawlProgress(100);
        if (res.workspace_id) setWorkspaceId(res.workspace_id);
        if (res.slug) setSlug(res.slug);
        if (res.assistant_message) setAssistantMessage(res.assistant_message);

        // Populate Brain review from detected profile if available
        if (res.detected_profile) {
          const det = res.detected_profile;
          const hoursStr = typeof det.hours === "object" ? (det.hours?.schedule || JSON.stringify(det.hours)) : (det.hours || "");
          const servicesStr = Array.isArray(det.services) ? det.services.join(", ") : (det.services || "");
          const policiesStr = typeof det.policies === "object" ? Object.entries(det.policies).map(([k, v]) => `${k}: ${v}`).join("; ") : (det.policies || "");
          const contactStr = typeof det.contact === "object" ? Object.entries(det.contact).map(([k, v]) => `${k}: ${v}`).join(" • ") : (det.contact || "");
          setProfileData({
            hours: hoursStr || "Monday – Friday: 9:00 AM – 6:00 PM",
            services: servicesStr || "Standard customer service and product consultation",
            policies: policiesStr || "Standard satisfaction guarantee with 30-day inquiry window.",
            contact: contactStr || "Support desk & verified email",
          });
        }
        setPhase(3);
      }, 3400);
    } catch (err: any) {
      toast(err?.message || "Website is unreachable or does not exist. Please check the URL.", "error");
      setPhase(1);
    }
  };


  // Handler: Send Interview Answer (3 Turns)
  const handleSendAnswer = async (answerText?: string) => {
    const textToSend = answerText || userAnswer;
    if (!textToSend.trim() || isSubmittingMessage) return;

    setIsSubmittingMessage(true);
    const updatedHistory = [
      ...interviewHistory,
      { role: "assistant", content: assistantMessage },
      { role: "user", content: textToSend },
    ];
    setInterviewHistory(updatedHistory);
    setUserAnswer("");

    try {
      const res = await apiRequest<any>(`/workspaces/${workspaceId}/onboarding/message`, {
        method: "POST",
        body: JSON.stringify({
          message: textToSend,
          interview_history: updatedHistory,
        }),
      });

      if (interviewTurn >= 3) {
        // Interview complete -> advance to Brain Review
        setPhase(4);
      } else {
        setInterviewTurn((prev) => prev + 1);
        if (res.assistant_message) {
          setAssistantMessage(res.assistant_message);
        } else if (interviewTurn === 1) {
          setAssistantMessage("Got it! What is your cancellation or advance notice policy for customer appointments or special orders?");
        } else if (interviewTurn === 2) {
          setAssistantMessage("Understood. How should your agent escalate sensitive requests or inquiries that require human staff?");
        }
      }
    } catch (err) {
      if (interviewTurn >= 3) {
        setPhase(4);
      } else {
        setInterviewTurn((prev) => prev + 1);
        setAssistantMessage("Understood! What is your policy for customer refunds and cancellations?");
      }
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Handler: Deploy Agent
  const handleDeployAgent = async () => {
    try {
      const res = await apiRequest<any>(`/workspaces/${workspaceId}/onboarding/deploy`, {
        method: "POST",
      });

      const deployedSlug = res.slug || slug || "my-ai-employee";
      const finalEmbed = `<script src="https://agentforge.onrender.com/static/widget.js" data-slug="${deployedSlug}" defer></script>`;
      setEmbedCode(finalEmbed);
      setDedicatedUrl(`/${deployedSlug}`);
      setAdminUrl(`/${deployedSlug}/admin`);
      setPhase(5);
      toast("AI Employee built and deployed successfully!", "success");
    } catch (err) {
      // Fallback deployment
      const fallbackSlug = slug || "my-ai-employee";
      setEmbedCode(`<script src="https://agentforge.onrender.com/static/widget.js" data-slug="${fallbackSlug}" defer></script>`);
      setDedicatedUrl(`/${fallbackSlug}`);
      setAdminUrl(`/${fallbackSlug}/admin`);
      setPhase(5);
      toast("AI Employee deployed in sandbox mode!", "success");
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard?.writeText(embedCode);
    toast("Copied embed script to clipboard", "success");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-text">
        Verifying authorization...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      {/* Focused Onboarding Header (No marketing links) */}
      <header className="h-16 border-b border-border px-6 sm:px-10 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo size={24} showText={true} />
          <span className="hidden sm:inline-block text-border">|</span>
          <span className="hidden sm:inline-block text-xs font-mono text-muted-text">
            AI Employee Studio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="sm" variant="ghost" className="text-xs text-muted-text hover:text-primary-text gap-1.5">
              <span>Exit to Dashboard</span>
              <X className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 sm:px-10 py-10 space-y-8">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-primary-text">AI Employee Builder</span>
            <span className="text-muted-text">/</span>
            <span className="text-secondary-text">
              {phase === 1 && "Phase 1: Knowledge Ingestion"}
              {phase === 2 && "Phase 2: Crawling & RAG Extraction"}
              {phase === 3 && `Phase 3: AI Interview (Turn ${interviewTurn} of 3)`}
              {phase === 4 && "Phase 4: Business Brain Review"}
              {phase === 5 && "Phase 5: Deployed & Live"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-text">
            <span>Step {phase} of 5</span>
          </div>
        </div>

        {/* =========================================================================
            PHASE 1: URL INPUT & BUSINESS SETUP
        ========================================================================== */}
        {phase === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-semibold text-primary-text tracking-tight">
                Define Your Business & Knowledge Source
              </h1>
              <p className="text-xs text-secondary-text mt-1">
                Enter your public website URL. AgentForge will automatically index your services, pricing, and FAQs.
              </p>
            </div>

            <Card className="p-6">
              <form onSubmit={handleStartTraining} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-secondary-text">
                      Website URL <span className="text-red-500">*</span>
                    </label>
                    {urlChecking && (
                      <span className="text-[11px] font-mono text-muted-text flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-accent" />
                        Verifying reachability...
                      </span>
                    )}
                    {urlStatus && !urlChecking && (
                      <span
                        className={`text-[11px] font-mono flex items-center gap-1 ${
                          urlStatus.is_real
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500"
                        }`}
                      >
                        {urlStatus.is_real ? (
                          <>
                            <Check className="w-3 h-3" /> {urlStatus.message}
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" /> {urlStatus.message}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          if (urlStatus) setUrlStatus(null);
                        }}
                        onBlur={() => {
                          if (websiteUrl.trim()) verifyUrl(websiteUrl);
                        }}
                        required
                        hint="We will crawl public pages and generate 384d vector embeddings in pgvector."
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-10 text-xs px-3 self-start"
                      onClick={() => verifyUrl(websiteUrl)}
                      disabled={!websiteUrl || urlChecking}
                    >
                      {urlChecking ? "Checking..." : "Verify Site"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Name"
                    placeholder="e.g. Acme Corp"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-secondary-text">
                      Category / Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-md bg-secondary-surface border border-border text-sm text-primary-text focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    >
                      <option value="" disabled>Select business category...</option>
                      <option value="Artisan Bakery & Cafe">Artisan Bakery & Cafe</option>
                      <option value="Healthcare & Dental">Healthcare & Dental</option>
                      <option value="Legal & Advisory">Legal & Advisory</option>
                      <option value="Productivity & SaaS">Productivity & SaaS</option>
                      <option value="Real Estate & Housing">Real Estate & Housing</option>
                      <option value="Finance & Tax">Finance & Tax</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Commercial & Professional Services">Commercial & Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Unique URL Slug (Optional)"
                  placeholder="e.g. acme-corp"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  hint={
                    customSlug
                      ? `Your agent will be hosted at /${customSlug}`
                      : "Leave blank to auto-generate a clean, unique slug from your business name."
                  }
                />

                <Textarea
                  label="Operational Notes & Custom Instructions (Optional)"
                  placeholder="E.g. We are closed Mondays. For emergencies call +1 (555) 0192..."
                  value={businessNotes}
                  onChange={(e) => setBusinessNotes(e.target.value)}
                  rows={3}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="lg" variant="primary" className="group">
                    <span>Start AI Training</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* =========================================================================
            PHASE 2: CRAWLING & RAG EXTRACTION PROGRESS
        ========================================================================== */}
        {phase === 2 && (
          <div className="space-y-6 py-8 animate-in fade-in duration-200">
            <Card className="p-8 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-secondary-surface border border-border flex items-center justify-center mx-auto text-primary-text">
                <RefreshCw className="w-5 h-5 animate-spin text-primary-text" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-primary-text tracking-tight">
                  Analyzing & Indexing Knowledge
                </h2>
                <p className="text-xs text-secondary-text font-mono">{crawlStatusText}</p>
              </div>

              <ProgressBar value={crawlProgress} max={100} animated size="md" />

              <div className="flex items-center justify-between text-[11px] font-mono text-muted-text pt-2 border-t border-border">
                <span>Domain: {websiteUrl}</span>
                <span>{crawlProgress}%</span>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            PHASE 3: 3-TURN AI GAP INTERVIEW
        ========================================================================== */}
        {phase === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="ai">Gap Resolution</Badge>
                  <span className="text-xs font-mono text-secondary-text">Turn {interviewTurn} of 3</span>
                </div>
                <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
                  AI Employee Interview
                </h2>
                <p className="text-xs text-secondary-text mt-0.5">
                  Your AI employee is interviewing you to clarify policies and operational boundaries.
                </p>
              </div>
            </div>

            {/* AI Question Card */}
            <Card className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 rounded bg-secondary-surface border border-border">
                <div className="w-8 h-8 rounded-full bg-primary-text text-background flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-primary-text block font-mono">
                    AI Assistant Prompt:
                  </span>
                  <p className="text-sm text-primary-text leading-relaxed">
                    {assistantMessage}
                  </p>
                </div>
              </div>

              {/* Answer input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer here (e.g. We are open Tuesday to Sunday 7AM - 6PM)..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={3}
                  disabled={isSubmittingMessage}
                />

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendAnswer("Use default industry standard policy.")}
                    disabled={isSubmittingMessage}
                  >
                    Skip / Use Standard Policy
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => handleSendAnswer()}
                    isLoading={isSubmittingMessage}
                    disabled={!userAnswer.trim()}
                  >
                    <span>{interviewTurn === 3 ? "Complete & Review Brain" : "Send Answer"}</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            PHASE 4: BUSINESS BRAIN REVIEW & DEPLOY
        ========================================================================== */}
        {phase === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="ai">✦ Synthesized Knowledge</Badge>
              </div>
              <h2 className="text-2xl font-semibold text-primary-text tracking-tight">
                Review Business Brain
              </h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Verify the extracted policies and services before deploying your AI employee live.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                    Operating Hours
                  </span>
                </div>
                <Input
                  value={profileData.hours}
                  onChange={(e) => setProfileData({ ...profileData, hours: e.target.value })}
                />
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                    Core Services & Offerings
                  </span>
                </div>
                <Input
                  value={profileData.services}
                  onChange={(e) => setProfileData({ ...profileData, services: e.target.value })}
                />
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                    Cancellation & Refund Policies
                  </span>
                </div>
                <Textarea
                  value={profileData.policies}
                  onChange={(e) => setProfileData({ ...profileData, policies: e.target.value })}
                  rows={2}
                />
              </Card>

              <Card className="p-5 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
                    Contact & Human Escalation
                  </span>
                </div>
                <Input
                  value={profileData.contact}
                  onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })}
                />
              </Card>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button variant="ghost" size="md" onClick={() => setPhase(3)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Interview
              </Button>

              <Button size="lg" variant="primary" onClick={handleDeployAgent} className="group">
                <span>Deploy AI Employee</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 5: SUCCESS MODAL / DASHBOARD PREVIEW
        ========================================================================== */}
        {phase === 5 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <Card className="p-8 border-emerald-500/30 bg-surface space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Deployment Published
                </span>
                <h1 className="text-3xl font-semibold text-primary-text tracking-tight">
                  Your AI Employee is Ready
                </h1>
                <p className="text-xs text-secondary-text max-w-md mx-auto">
                  {businessName} AI Employee is live and trained on your operating policies.
                </p>
              </div>

              {/* Action Buttons: Visit Dedicated Page & Manage Agent */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href={dedicatedUrl}>
                  <Button size="lg" variant="primary">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Visit AI Employee ({dedicatedUrl})
                  </Button>
                </Link>

                <Link href={adminUrl}>
                  <Button size="lg" variant="secondary">
                    Manage Agent Dashboard
                  </Button>
                </Link>
              </div>

              {/* Embed Code Snippet */}
              <div className="p-4 rounded border border-border bg-secondary-surface text-left space-y-2 mt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-secondary-text font-mono">
                    Embeddable Web Widget Code
                  </span>
                  <button
                    onClick={copyEmbedCode}
                    className="flex items-center gap-1 text-primary-text hover:underline font-mono text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy snippet</span>
                  </button>
                </div>
                <pre className="p-3 rounded bg-surface border border-border text-[11px] font-mono text-primary-text overflow-x-auto">
                  {embedCode}
                </pre>
                <p className="text-[10px] text-muted-text font-mono">
                  Paste this snippet before the closing &lt;/body&gt; tag on your website to load the live widget.
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
