"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  large?: boolean;
}

export function SearchBar({ placeholder = "Search opportunities...", defaultValue = "", className = "", large = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-border bg-white py-3 pl-10 pr-4 text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${large ? "text-lg" : "text-sm"}`}
        />
        <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors ${large ? "px-6" : ""}`}>
          Search
        </button>
      </div>
    </form>
  );
}
