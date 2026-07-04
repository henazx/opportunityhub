"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_TYPE_COLORS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function getRankInfo(rank: number) {
  if (rank >= 90) return { label: "Excellent", color: "text-green-700", bg: "bg-green-100", icon: "🏆" };
  if (rank >= 75) return { label: "Very Good", color: "text-blue-700", bg: "bg-blue-100", icon: "⭐" };
  if (rank >= 60) return { label: "Good", color: "text-yellow-700", bg: "bg-yellow-100", icon: "✅" };
  if (rank >= 40) return { label: "Fair", color: "text-orange-700", bg: "bg-orange-100", icon: "⚠️" };
  return { label: "Low", color: "text-red-700", bg: "bg-red-100", icon: "❌" };
}

function getDeadlineInfo(deadline?: string) {
  if (!deadline) return null;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Expired", color: "bg-red-100 text-red-800 border-red-300", urgent: true, daysLeft: 0 };
  if (daysLeft <= 3) return { label: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, color: "bg-red-100 text-red-800 border-red-300", urgent: true, daysLeft };
  if (daysLeft <= 7) return { label: `${daysLeft} days left`, color: "bg-orange-100 text-orange-800 border-orange-300", urgent: true, daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft} days left`, color: "bg-yellow-100 text-yellow-800 border-yellow-300", urgent: false, daysLeft };
  return { label: `${daysLeft} days left`, color: "bg-green-100 text-green-800 border-green-300", urgent: false, daysLeft };
}

export function OpportunityDetailClient() {
  const params = useParams();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchOpportunity(); }, [params.id]);

  async function fetchOpportunity() {
    try {
      const data = await api.get<any>(`/opportunities/${params.id}`);
      setOpportunity(data);
    } catch (err) {
      setError("Opportunity not found");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">Opportunity Not Found</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link href="/opportunities" className="mt-6 inline-block text-primary hover:underline">Back to Opportunities</Link>
      </div>
    );
  }

  const typeLabel = OPPORTUNITY_TYPE_LABELS[opportunity.type] || opportunity.type;
  const typeColor = OPPORTUNITY_TYPE_COLORS[opportunity.type] || "bg-gray-100 text-gray-800";
  const rankInfo = opportunity.overallRank ? getRankInfo(opportunity.overallRank) : null;
  const deadlineInfo = getDeadlineInfo(opportunity.applicationDeadline);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/opportunities" className="mb-6 inline-flex items-center text-sm text-muted hover:text-foreground">
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Opportunities
      </Link>

      <article className="rounded-xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${typeColor}`}>
                {typeLabel}
              </span>
              {opportunity.isRemote && <Badge variant="success">Remote</Badge>}
              {opportunity.isFeatured && <Badge variant="warning">Featured</Badge>}
              {rankInfo && (
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${rankInfo.bg} ${rankInfo.color}`}>
                  {rankInfo.icon} Ranked {opportunity.overallRank}/100
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{opportunity.title}</h1>
            {opportunity.organization && (
              <p className="mt-2 text-muted flex items-center gap-2">
                {opportunity.organization.name}
                {opportunity.organization.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    ✓ Verified
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {deadlineInfo && (
          <div className={`mt-4 rounded-lg border p-3 ${deadlineInfo.color} ${deadlineInfo.urgent ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-2">
              {deadlineInfo.urgent && <span className="text-lg">🔥</span>}
              <div>
                <p className="font-medium">
                  Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString("en-ET", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-sm mt-0.5">
                  {deadlineInfo.urgent
                    ? `Only ${deadlineInfo.daysLeft} day${deadlineInfo.daysLeft !== 1 ? 's' : ''} remaining — apply now!`
                    : `${deadlineInfo.label} until deadline`}
                </p>
              </div>
            </div>
          </div>
        )}

        {(opportunity.trustScore || opportunity.qualityScore || opportunity.overallRank) && (
          <div className="mt-6 rounded-lg border border-border bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">📊 Opportunity Scores</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <ScoreBar label="Overall Rank" score={opportunity.overallRank || 0} color="bg-primary" />
              <ScoreBar label="Trust Score" score={opportunity.trustScore || 0} color="bg-blue-500" />
              <ScoreBar label="Quality Score" score={opportunity.qualityScore || 0} color="bg-green-500" />
            </div>
            {opportunity.linkStatus && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-muted">Link Status:</span>
                {opportunity.linkStatus === "valid" ? (
                  <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                    ✅ Verified Working (HTTP {opportunity.linkResponseCode})
                  </span>
                ) : opportunity.linkStatus === "broken" ? (
                  <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                    ❌ Link Issue Detected (HTTP {opportunity.linkResponseCode || "Error"})
                  </span>
                ) : (
                  <span className="text-muted">⏳ Not yet checked</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {opportunity.salaryMin && opportunity.salaryMax && (
            <div className="flex items-center gap-2 text-sm">
              💰 <span className="text-muted">Salary:</span>
              <span className="font-medium">{opportunity.salaryCurrency || "ETB"} {opportunity.salaryMin.toLocaleString()} - {opportunity.salaryMax.toLocaleString()}</span>
            </div>
          )}
          {opportunity.locations && opportunity.locations.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              📍 <span className="text-muted">Location:</span>
              <span className="font-medium">{opportunity.locations.map((l: any) => l.location.name).join(", ")}</span>
            </div>
          )}
          {opportunity.startDate && (
            <div className="flex items-center gap-2 text-sm">
              📅 <span className="text-muted">Starts:</span>
              <span className="font-medium">{new Date(opportunity.startDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {opportunity.tags.map(({ tag }: any) => (
              <span key={tag.id || tag.name} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">Description</h2>
          <div className="mt-4 prose prose-sm max-w-none text-muted whitespace-pre-wrap">
            {opportunity.description}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {opportunity.applicationUrl && opportunity.linkStatus === "valid" && (
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              ✓ Apply Now (Verified Link)
            </a>
          )}
          {opportunity.applicationUrl && opportunity.linkStatus !== "valid" && (
            <span className="rounded-lg bg-gray-200 px-6 py-3 text-sm font-medium text-gray-500 cursor-not-allowed" title="This link could not be verified">
              Apply Now (Link Unverified)
            </span>
          )}
          {opportunity.url && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
            >
              View Original Source →
            </a>
          )}
        </div>

        {opportunity.linkStatus === "broken" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ⚠️ <strong>Note:</strong> This application link could not be verified. The position may be filled or the page moved.
            Please check the original source or look for alternative application methods.
          </div>
        )}

        <div className="mt-6 flex items-center gap-4 text-xs text-muted">
          <span>👀 {opportunity.viewCount} views</span>
          <span>•</span>
          <span>Imported {new Date(opportunity.importedAt).toLocaleDateString()}</span>
          {opportunity.lastLinkCheck && (
            <>
              <span>•</span>
              <span>Link checked {new Date(opportunity.lastLinkCheck).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
