"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiRequest, AIEmployeeItem, MOCK_DIRECTORY_ITEMS, MOCK_CATEGORIES } from "@/lib/api";
import { Search, ArrowRight, Bot, Sparkles, Building2, Layers } from "lucide-react";

export default function DirectoryPage() {
  const [categories, setCategories] = useState<string[]>(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<AIEmployeeItem[]>(MOCK_DIRECTORY_ITEMS);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    apiRequest<string[]>("/directory/categories")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setCategories(["All", ...res]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch items based on category and search
  useEffect(() => {
    setIsLoading(true);
    const categoryParam = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";

    apiRequest<{ items: AIEmployeeItem[] }>(`/directory?limit=24${categoryParam}${searchParam}`)
      .then((res) => {
        if (res && res.items) {
          setItems(res.items);
        }
      })
      .catch(() => {
        // Filter local mock data
        let filtered = [...MOCK_DIRECTORY_ITEMS];
        if (selectedCategory !== "All") {
          filtered = filtered.filter((i) =>
            i.category.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        }
        if (searchQuery) {
          filtered = filtered.filter(
            (i) =>
              i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              i.summary.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setItems(filtered);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-muted-text uppercase tracking-wider">
                Public Marketplace
              </span>
              <span className="text-border">•</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {items.length} Active Employees
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-primary-text tracking-tight">
              AI Employee Directory
            </h1>
            <p className="text-xs text-secondary-text mt-1 max-w-xl">
              Discover and chat with specialized AI employees trained on verified company policies, documentation, and tools.
            </p>
          </div>

          <Link href="/pricing">
            <Button size="sm" variant="primary">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Onboard Your AI
            </Button>
          </Link>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-text" />
            <input
              type="text"
              placeholder="Search by business name, service, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded bg-surface border border-border text-xs text-primary-text placeholder:text-muted-text focus:outline-none focus:border-primary-text transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors select-none ${
                  selectedCategory === cat
                    ? "bg-primary-text text-background font-semibold shadow-subtle"
                    : "bg-surface border border-border text-secondary-text hover:text-primary-text hover:bg-secondary-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Employees Grid */}
        {items.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded bg-secondary-surface/40 space-y-2">
            <Bot className="w-8 h-8 text-muted-text mx-auto" />
            <p className="text-sm font-medium text-primary-text">No AI employees found</p>
            <p className="text-xs text-secondary-text">Try adjusting your category filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((ai) => (
              <Card key={ai.id} hoverable className="p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary-surface text-secondary-text border border-border">
                      {ai.category}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-primary-text tracking-tight group-hover:underline">
                    {ai.name}
                  </h3>

                  <p className="text-xs text-secondary-text leading-relaxed mt-2 line-clamp-3">
                    {ai.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border/60">
                    {ai.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary-surface text-muted-text border border-border/50"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-text truncate max-w-[120px]">
                    /{ai.slug}
                  </span>
                  <Link href={`/${ai.slug}`}>
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                      <span>Chat Now</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
