"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/search-bar";
import { Recommendations } from "@/components/recommendations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const OPPORTUNITY_TYPES = [
  { type: "JOB", label: "Jobs", icon: "💼", color: "bg-green-50 hover:bg-green-100 border-green-200" },
  { type: "INTERNSHIP", label: "Internships", icon: "🎓", color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" },
  { type: "SCHOLARSHIP", label: "Scholarships", icon: "📚", color: "bg-red-50 hover:bg-red-100 border-red-200" },
  { type: "GRANT", label: "Grants", icon: "💰", color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200" },
  { type: "TRAINING", label: "Training", icon: "⚙️", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { type: "VOLUNTEER", label: "Volunteer", icon: "🤝", color: "bg-teal-50 hover:bg-teal-100 border-teal-200" },
  { type: "EVENT", label: "Events", icon: "📅", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
  { type: "REMOTE_WORK", label: "Remote Work", icon: "🌍", color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
];

function DeadlineBanner() {
  const [deadlineData, setDeadlineData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/validation/deadlines`)
      .then(r => r.json())
      .then(setDeadlineData)
      .catch(() => {});
  }, []);

  if (!deadlineData?.stats) return null;

  const { expiringSoon, expired } = deadlineData.stats;
  if (expiringSoon === 0 && expired === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 mb-6">
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-orange-900">
              {expiringSoon > 0 && (
                <span>🔥 {expiringSoon} opportunity closing {expiringSoon === 1 ? "today" : "within 3 days"}! </span>
              )}
              {expired > 0 && (
                <span className="text-orange-700">| {expired} expired listing{expired !== 1 ? "s" : ""}</span>
              )}
            </p>
            <p className="text-sm text-orange-700 mt-0.5">
              <Link href="/opportunities?sort=deadline" className="underline hover:text-orange-900">
                View deadline-sorted opportunities →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationBanner() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/validation/dashboard`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data?.stats) return null;

  const { valid, broken, total } = data.stats;
  const validPct = total > 0 ? Math.round((valid / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${validPct >= 80 ? 'bg-green-500' : validPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-foreground">
              Link Health: {validPct}% verified
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>✅ {valid} valid</span>
            <span>❌ {broken} broken</span>
            <span>📊 {total} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Ethiopian photo background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1600&h=900&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 mb-6">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              100% Free · Verified Links · Ranked Opportunities
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ethiopia&apos;s Home for
              <span className="block text-secondary">Real Opportunities</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-green-100 sm:text-xl">
              Every link is checked. Every opportunity is ranked. Find jobs, scholarships,
              and grants with verified application links.
            </p>

            <div className="mx-auto mt-10 max-w-2xl">
              <SearchBar large placeholder="Search for jobs, skills, organizations..." className="shadow-2xl" />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-green-100">
              <span>Popular in Ethiopia:</span>
              {["Software Developer", "Data Analyst", "NGO Jobs", "Scholarships 2024", "Remote Work"].map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25 transition-colors text-white">
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DeadlineBanner />
      <ValidationBanner />

      {/* Stats */}
      <section className="border-b border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Opportunities", value: "10,000+" },
              { label: "Links Verified", value: "100%" },
              { label: "Ranked & Scored", value: "100%" },
              { label: "Completely Free", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Browse by Category</h2>
            <p className="mt-3 text-muted">Find the right opportunity type for your goals</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {OPPORTUNITY_TYPES.map((item) => (
              <Link key={item.type} href={`/opportunities?type=${item.type}`} className={`group flex flex-col items-center rounded-xl border p-6 transition-all hover:shadow-md ${item.color}`}>
                <span className="text-4xl">{item.icon}</span>
                <span className="mt-3 font-medium text-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Recommendations */}
      <Recommendations />

      {/* Why OpportunityHub */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why OpportunityHub is Different</h2>
            <p className="mt-3 text-muted">We don&apos;t just list opportunities — we verify and rank them</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Link Validation",
                description: "Every application link is automatically checked. We tell you if it works before you click.",
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
              },
              {
                icon: "🏆",
                title: "Trust & Quality Scores",
                description: "Each opportunity is scored 0-100 based on link validity, completeness, and source reliability.",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
              },
              {
                icon: "⏰",
                title: "Deadline Tracking",
                description: "Never miss a deadline. We highlight closing opportunities and warn you about expiring ones.",
                image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop",
              },
              {
                icon: "🤖",
                title: "Smart Recommendations",
                description: "Personalized suggestions based on your interests, bookmarks, and browsing history.",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=250&fit=crop",
              },
              {
                icon: "🆓",
                title: "100% Free Forever",
                description: "No premium tiers. Every feature — validation, ranking, recommendations — is free.",
                image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop",
              },
              {
                icon: "🇪🇹",
                title: "Built for Ethiopia",
                description: "Curated from Ethiopian companies, NGOs, government, and international organizations.",
                image: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=250&fit=crop",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-3 left-3 text-3xl">{item.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=500&fit=crop"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-emerald-700/90" />
            <div className="relative p-8 sm:p-12 text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Start Exploring Verified Opportunities</h2>
              <p className="mt-3 text-green-100">No account needed. Every link is checked. Every opportunity is ranked.</p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/opportunities" className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-primary hover:bg-gray-100 transition-colors">
                  Browse Verified Jobs
                </Link>
                <Link href="/auth/register" className="rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
