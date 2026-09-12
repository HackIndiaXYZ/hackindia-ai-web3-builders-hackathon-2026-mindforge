"use client";

import React, { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const DATA_30D = [
  { date: "Aug 12", conversations: 38, resolutionRate: 84.5, escalations: 4, latency: 1.4 },
  { date: "Aug 16", conversations: 44, resolutionRate: 86.0, escalations: 3, latency: 1.3 },
  { date: "Aug 20", conversations: 42, resolutionRate: 85.2, escalations: 5, latency: 1.3 },
  { date: "Aug 24", conversations: 51, resolutionRate: 88.0, escalations: 4, latency: 1.2 },
  { date: "Aug 28", conversations: 48, resolutionRate: 87.1, escalations: 3, latency: 1.1 },
  { date: "Sep 01", conversations: 55, resolutionRate: 89.2, escalations: 4, latency: 1.2 },
  { date: "Sep 05", conversations: 59, resolutionRate: 87.8, escalations: 5, latency: 1.2 },
  { date: "Sep 10", conversations: 62, resolutionRate: 88.4, escalations: 3, latency: 1.1 },
];

const DATA_7D = [
  { date: "Sep 04", conversations: 49, resolutionRate: 86.5, escalations: 4, latency: 1.2 },
  { date: "Sep 05", conversations: 59, resolutionRate: 87.8, escalations: 5, latency: 1.2 },
  { date: "Sep 06", conversations: 53, resolutionRate: 87.2, escalations: 3, latency: 1.2 },
  { date: "Sep 07", conversations: 31, resolutionRate: 90.1, escalations: 2, latency: 1.1 },
  { date: "Sep 08", conversations: 36, resolutionRate: 88.9, escalations: 2, latency: 1.1 },
  { date: "Sep 09", conversations: 58, resolutionRate: 87.5, escalations: 4, latency: 1.2 },
  { date: "Sep 10", conversations: 62, resolutionRate: 88.4, escalations: 3, latency: 1.1 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const chartData = timeRange === "7d" ? DATA_7D : DATA_30D;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header per PRD Section 28 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary-text tracking-tight">
            Analytics
          </h1>
          <p className="text-xs text-secondary-text mt-0.5">
            Operational performance metrics and resolution benchmarks.
          </p>
        </div>

        {/* Date Filters */}
        <div className="inline-flex rounded border border-border bg-surface p-0.5 text-xs">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded transition-colors ${
                timeRange === range
                  ? "bg-secondary-surface text-primary-text font-medium"
                  : "text-secondary-text hover:text-primary-text"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Restrained Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversations"
          value="1,284"
          change="+12.4%"
          changeType="positive"
          detail="Total interactions"
        />
        <StatCard
          label="Resolution rate"
          value="87.4%"
          change="+2.1%"
          changeType="positive"
          detail="Target: 85.0%"
        />
        <StatCard
          label="Escalations"
          value="8.2%"
          change="-0.8%"
          changeType="positive"
          detail="Target: <10.0%"
        />
        <StatCard
          label="Avg response"
          value="1.2s"
          change="-0.3s"
          changeType="positive"
          detail="P95: 2.1s"
        />
      </div>

      {/* Restrained Charts (No rainbow dashboards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Conversations over time */}
        <Card className="p-5">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Conversations over time</CardTitle>
              <CardDescription>Daily customer sessions resolved autonomously</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="conversationsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--primary-text)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="var(--primary-text)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#conversationsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Resolution rate */}
        <Card className="p-5">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Resolution rate</CardTitle>
              <CardDescription>Percentage of inquiries completed without escalation</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <YAxis
                  domain={[75, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--primary-text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="resolutionRate"
                  stroke="var(--primary-text)"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "var(--primary-text)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Escalations */}
        <Card className="p-5">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Escalations</CardTitle>
              <CardDescription>Sessions routed to human agent tier</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--primary-text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="escalations"
                  stroke="#D97706"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#D97706" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Response latency */}
        <Card className="p-5">
          <CardHeader className="mb-2">
            <div>
              <CardTitle>Response latency</CardTitle>
              <CardDescription>First token time-to-first-byte in seconds</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                />
                <YAxis
                  domain={[0.8, 1.8]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-text)" }}
                  unit="s"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--primary-text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--primary-text)"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "var(--primary-text)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
