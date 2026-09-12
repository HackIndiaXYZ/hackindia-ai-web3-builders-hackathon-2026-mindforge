"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme-provider";
import { useToast } from "@/components/ui/toast";
import {
  Sun,
  Moon,
  Laptop,
  Users,
  Webhook,
  Key,
  Sliders,
  Cpu,
  Bell,
  Palette,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"appearance" | "workspace" | "agent">("appearance");
  const [model, setModel] = useState("claude-3-5-sonnet-20241022");
  const [notifyEscalation, setNotifyEscalation] = useState(true);
  const [notifyConfidence, setNotifyConfidence] = useState(false);

  const handleSave = () => {
    toast("Settings preferences saved", "success");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-secondary-text mt-0.5">
          Workspace administration, model configuration, and interface appearance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border text-xs">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`pb-2.5 px-3 font-medium transition-colors relative ${
            activeTab === "appearance"
              ? "text-primary-text border-b-2 border-primary-text"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          Appearance & Theme
        </button>
        <button
          onClick={() => setActiveTab("agent")}
          className={`pb-2.5 px-3 font-medium transition-colors relative ${
            activeTab === "agent"
              ? "text-primary-text border-b-2 border-primary-text"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          Agent & Model
        </button>
        <button
          onClick={() => setActiveTab("workspace")}
          className={`pb-2.5 px-3 font-medium transition-colors relative ${
            activeTab === "workspace"
              ? "text-primary-text border-b-2 border-primary-text"
              : "text-secondary-text hover:text-primary-text"
          }`}
        >
          Workspace & Secrets
        </button>
      </div>

      {/* Tab 1: Appearance & Theme (PRD Section 31) */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-primary-text">Theme</h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Select your preferred color system. Persisted in localStorage.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded border text-left flex flex-col justify-between h-24 transition-colors ${
                  theme === "light"
                    ? "border-primary-text bg-secondary-surface"
                    : "border-border bg-surface hover:bg-secondary-surface/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="w-4 h-4 text-primary-text" />
                  <span className={`w-3 h-3 rounded-full border ${theme === "light" ? "bg-primary-text" : "border-border"}`} />
                </div>
                <span className="text-xs font-medium text-primary-text">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded border text-left flex flex-col justify-between h-24 transition-colors ${
                  theme === "dark"
                    ? "border-primary-text bg-secondary-surface"
                    : "border-border bg-surface hover:bg-secondary-surface/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className="w-4 h-4 text-primary-text" />
                  <span className={`w-3 h-3 rounded-full border ${theme === "dark" ? "bg-primary-text" : "border-border"}`} />
                </div>
                <span className="text-xs font-medium text-primary-text">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded border text-left flex flex-col justify-between h-24 transition-colors ${
                  theme === "system"
                    ? "border-primary-text bg-secondary-surface"
                    : "border-border bg-surface hover:bg-secondary-surface/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Laptop className="w-4 h-4 text-primary-text" />
                  <span className={`w-3 h-3 rounded-full border ${theme === "system" ? "bg-primary-text" : "border-border"}`} />
                </div>
                <span className="text-xs font-medium text-primary-text">System Synced</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Agent Configuration */}
      {activeTab === "agent" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-primary-text">Default Model</h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Underlying reasoning engine for grounding and tool invocation.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-9 px-3 rounded bg-surface border border-border text-primary-text text-xs focus:outline-none focus:border-primary-text"
              >
                <option value="claude-3-5-sonnet-20241022">
                  Anthropic Claude 3.5 Sonnet (Default for reasoning & tools)
                </option>
                <option value="claude-3-5-haiku-20241022">
                  Anthropic Claude 3.5 Haiku (Fast latency tier)
                </option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-sm font-semibold text-primary-text">Notifications</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-primary-text block">Escalation alerts</span>
                    <span className="text-secondary-text">Notify human support when a ticket escalates.</span>
                  </div>
                  <Switch checked={notifyEscalation} onCheckedChange={setNotifyEscalation} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-primary-text block">Low confidence alerts</span>
                    <span className="text-secondary-text">Notify team when grounding score falls below 85%.</span>
                  </div>
                  <Switch checked={notifyConfidence} onCheckedChange={setNotifyConfidence} />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="primary" onClick={handleSave}>
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Workspace, Members, Integrations, Secrets */}
      {activeTab === "workspace" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-primary-text">Workspace Members</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-secondary-surface border border-border">
                <div>
                  <span className="font-medium text-primary-text block">Admin (You)</span>
                  <span className="font-mono text-muted-text">admin@acme.com</span>
                </div>
                <span className="text-muted-text font-mono">Owner</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-secondary-surface border border-border">
                <div>
                  <span className="font-medium text-primary-text block">Sarah Jenkins</span>
                  <span className="font-mono text-muted-text">sarah@acme.com</span>
                </div>
                <span className="text-muted-text font-mono">Operator</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-primary-text">API Secrets & Tokens</h3>
            <div className="space-y-3 text-xs">
              <Input
                label="Acme API Key"
                type="password"
                defaultValue="••••••••••••••••••••••••••••••••"
                readOnly
              />
              <Input
                label="Zendesk Webhook Secret"
                type="password"
                defaultValue="••••••••••••••••"
                readOnly
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
