"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { SearchBar } from "@/components/ui/search-bar";
import { Opportunity, OPPORTUNITY_TYPE_LABELS, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";

const TYPES = Object.entries(OPPORTUNITY_TYPE_LABELS);

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "";

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState(initialType);
  const [isRemote, setIsRemote] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  useEffect(() => { fetchOpportunities(); }, [page, selectedType, isRemote, verifiedOnly]);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (selectedType) params.set("type", selectedType);
      if (isRemote) params.set("isRemote", "true");
      if (verifiedOnly) params.set("verifiedOnly", "true");

      const data = await api.get<PaginatedResponse<Opportunity>>(`/opportunities?${params.toString()}`);
      setOpportunities(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
        <p className="mt-2 text-muted">Discover your next opportunity from thousands of sources</p>
      </div>

      <div className="mb-6">
        <SearchBar placeholder="Search opportunities..." />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => { setSelectedType(""); setPage(1); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !selectedType ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Types
        </button>
        {TYPES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => { setSelectedType(value); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedType === value ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
        <label className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => { setIsRemote(e.target.checked); setPage(1); }}
            className="rounded"
          />
          Remote Only
        </label>
        <label className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
            className="rounded"
          />
          ✓ Verified Links Only
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted">No opportunities found</p>
          <p className="mt-2 text-sm text-muted">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 text-sm text-muted">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
