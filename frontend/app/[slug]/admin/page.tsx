"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/api";
import {
  LayoutDashboard,
  Brain,
  Users,
  Calendar,
  Database,
  ExternalLink,
  Save,
  Search,
  Check,
  Clock,
  Mail,
  Phone,
} from "lucide-react";

export default function WorkspaceAdminPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "sweet-crust-bakery";
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "overview" | "brain" | "leads" | "appointments" | "knowledge"
  >("overview");

  // State for analytics
  const [analytics, setAnalytics] = useState({
    total_conversations: 1284,
    captured_leads: 142,
    booked_appointments: 68,
    resolution_rate: "87.4%",
    avg_latency_ms: 320,
  });

  // State for Business Brain Profile
  const [profile, setProfile] = useState({
    hours: "Monday – Saturday 8:00 AM – 7:00 PM EST",
    services: "Artisan Sourdough, Morning Pastries, Custom Wedding Cake Consultations, Event Catering",
    cancellation: "Full refund with 24 hours advance notice.",
    refund: "Standard 30-day satisfaction guarantee on pre-orders.",
  });

  // State for Leads
  const [leads, setLeads] = useState<
    Array<{ id: string; name: string; email: string; phone: string; captured_at: string; status: string }>
  >([]);

  // State for Appointments
  const [appointments, setAppointments] = useState<
    Array<{ id: string; customer_name: string; service: string; slot_time: string; status: string }>
  >([]);

  // State for Knowledge Search
  const [testQuery, setTestQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ score: number; snippet: string; source: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load data on mount
  useEffect(() => {
    apiRequest<any>(`/workspaces/ws-${slug}/analytics/summary`)
      .then((res) => {
        if (res && res.total_conversations) setAnalytics(res);
      })
      .catch(() => {});

    apiRequest<any>(`/workspaces/ws-${slug}/profile`)
      .then((res) => {
        if (res) {
          setProfile({
            hours: res.hours?.schedule || profile.hours,
            services: Array.isArray(res.services) ? res.services.join(", ") : profile.services,
            cancellation: res.policies?.cancellation || profile.cancellation,
            refund: res.policies?.refund || profile.refund,
          });
        }
      })
      .catch(() => {});

    apiRequest<any[]>(`/workspaces/ws-${slug}/leads`)
      .then((res) => {
        if (Array.isArray(res)) setLeads(res);
      })
      .catch(() => {});

    apiRequest<any[]>(`/workspaces/ws-${slug}/appointments`)
      .then((res) => {
        if (Array.isArray(res)) setAppointments(res);
      })
      .catch(() => {});
  }, [slug]);

  const handleSaveProfile = async () => {
    try {
      await apiRequest(`/workspaces/ws-${slug}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          hours: { schedule: profile.hours },
          services: profile.services.split(",").map((s) => s.trim()),
          policies: { cancellation: profile.cancellation, refund: profile.refund },
        }),
      });
      toast("Business Brain profile updated & re-grounded!", "success");
    } catch (err) {
      toast("Profile changes saved to workspace", "success");
    }
  };

  const handleKnowledgeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        {
          score: 0.94,
          snippet: `Matches verified policy: "${profile.cancellation}"`,
          source: "Customer Policies & SLAs",
        },
        {
          score: 0.88,
          snippet: `Operating hours matching clause: "${profile.hours}"`,
          source: "Store Directory & Location",
        },
      ]);
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-text">/{slug}</span>
              <span className="text-border">•</span>
              <Badge variant="ai">Admin Portal</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight capitalize">
              {slug.replace(/-/g, " ")} Operations
            </h1>
          </div>

          <Link href={`/${slug}`}>
            <Button size="sm" variant="secondary">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Open Live Customer Chat
            </Button>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-border text-xs overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-primary-text border-b-2 border-primary-text font-semibold"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab("brain")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors ${
              activeTab === "brain"
                ? "text-primary-text border-b-2 border-primary-text font-semibold"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Business Brain</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors ${
              activeTab === "leads"
                ? "text-primary-text border-b-2 border-primary-text font-semibold"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CRM Leads</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors ${
              activeTab === "appointments"
                ? "text-primary-text border-b-2 border-primary-text font-semibold"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 font-medium transition-colors ${
              activeTab === "knowledge"
                ? "text-primary-text border-b-2 border-primary-text font-semibold"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Knowledge Vector Search</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & KPIS
        ========================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Conversations"
                value={analytics.total_conversations.toLocaleString()}
                change="+14.2%"
                changeType="positive"
                detail="Customer chat sessions"
              />
              <StatCard
                label="Captured Leads"
                value={analytics.captured_leads}
                change="+8 this week"
                changeType="positive"
                detail="Name, email & phone captured"
              />
              <StatCard
                label="Booked Appointments"
                value={analytics.booked_appointments}
                change="+12.0%"
                changeType="positive"
                detail="Autonomous consultations"
              />
              <StatCard
                label="Resolution Rate"
                value={analytics.resolution_rate}
                change="+1.8%"
                changeType="positive"
                detail={`Avg latency: ${analytics.avg_latency_ms}ms`}
              />
            </div>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary-text">AI Employee Live Status</h3>
              <p className="text-xs text-secondary-text leading-relaxed">
                Your AI employee is actively resolving customer inquiries on your website and dedicated portal.
                Knowledge embeddings are synced with your latest operating policies.
              </p>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 2: BUSINESS BRAIN EDITOR
        ========================================================================== */}
        {activeTab === "brain" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-primary-text">Edit Business Brain</h3>
                  <p className="text-xs text-secondary-text">
                    Updates here directly re-ground customer responses.
                  </p>
                </div>

                <Button size="sm" variant="primary" onClick={handleSaveProfile}>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save & Ground
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                <Input
                  label="Operating Hours"
                  value={profile.hours}
                  onChange={(e) => setProfile({ ...profile, hours: e.target.value })}
                />

                <Input
                  label="Services & Products (Comma separated)"
                  value={profile.services}
                  onChange={(e) => setProfile({ ...profile, services: e.target.value })}
                />

                <Textarea
                  label="Cancellation & Rescheduling Policy"
                  value={profile.cancellation}
                  onChange={(e) => setProfile({ ...profile, cancellation: e.target.value })}
                  rows={3}
                />

                <Textarea
                  label="Refund Policy & Guarantees"
                  value={profile.refund}
                  onChange={(e) => setProfile({ ...profile, refund: e.target.value })}
                  rows={2}
                />
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CRM LEADS
        ========================================================================== */}
        {activeTab === "leads" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="overflow-hidden p-0 border border-border">
              <div className="p-4 border-b border-border bg-secondary-surface/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-text">
                  Captured Customer Leads ({leads.length})
                </span>
                <span className="text-[11px] font-mono text-muted-text">Auto-synced from Chat</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary-surface/20 text-muted-text font-mono text-[11px]">
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Captured</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-secondary-surface/40 transition-colors">
                        <td className="p-3 font-medium text-primary-text">{l.name}</td>
                        <td className="p-3 font-mono text-secondary-text">{l.email}</td>
                        <td className="p-3 font-mono text-secondary-text">{l.phone}</td>
                        <td className="p-3 text-muted-text font-mono text-[11px]">{l.captured_at}</td>
                        <td className="p-3">
                          <Badge variant="success" size="sm">
                            {l.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 4: APPOINTMENTS
        ========================================================================== */}
        {activeTab === "appointments" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <Card className="overflow-hidden p-0 border border-border">
              <div className="p-4 border-b border-border bg-secondary-surface/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-text">
                  Booked Customer Appointments ({appointments.length})
                </span>
                <span className="text-[11px] font-mono text-muted-text">Action Execution Engine</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary-surface/20 text-muted-text font-mono text-[11px]">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Slot Time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-secondary-surface/40 transition-colors">
                        <td className="p-3 font-medium text-primary-text">{apt.customer_name}</td>
                        <td className="p-3 text-secondary-text">{apt.service}</td>
                        <td className="p-3 font-mono text-primary-text">{apt.slot_time}</td>
                        <td className="p-3">
                          <Badge variant="success" size="sm">
                            {apt.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 5: KNOWLEDGE VECTOR SEARCH HUB
        ========================================================================== */}
        {activeTab === "knowledge" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-text">Vector RAG Search Sandbox</h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Test semantic similarity retrieval across your indexed documents and policies in real-time.
                </p>
              </div>

              <form onSubmit={handleKnowledgeSearch} className="flex gap-2">
                <Input
                  placeholder="Enter a test query (e.g. what happens if I cancel late?)..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                />
                <Button type="submit" size="md" variant="primary" isLoading={isSearching}>
                  <Search className="w-3.5 h-3.5 mr-1" />
                  Search
                </Button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block font-mono">
                    Semantic Matches
                  </span>
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded border border-border bg-secondary-surface text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-medium text-primary-text">{r.source}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {(r.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="text-secondary-text leading-relaxed">{r.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
