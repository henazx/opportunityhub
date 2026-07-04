"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import { SearchBar } from "@/components/ui/search-bar";
import { Opportunity, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const performSearch = useCallback(async () => {
    if (!query.trim()) { setResults([]); setTotal(0); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", query.trim());
      params.set("page", String(page));
      params.set("limit", "12");
      const data = await api.get<PaginatedResponse<Opportunity>>(`/search?${params.toString()}`);
      setResults(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { performSearch(); }, [performSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Search Opportunities</h1>
        <p className="mt-2 text-muted">Find the perfect opportunity from thousands of sources</p>
      </div>

      <div className="mb-6">
        <SearchBar defaultValue={initialQuery} placeholder="Search by title, skill, organization..." large />
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-sm text-muted">
            {loading ? "Searching..." : `Found ${total} results for "${query}"`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center">
          <svg className="mx-auto h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {query ? "No results found" : "Start searching"}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {query ? "Try different keywords or adjust your search" : "Enter a search query to find opportunities"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <span className="px-4 text-sm text-muted">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
