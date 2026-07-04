"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Opportunity, OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_TYPE_COLORS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface OpportunityCardProps {
  opportunity: Opportunity & {
    trustScore?: number;
    qualityScore?: number;
    overallRank?: number;
    linkStatus?: string;
    applicationDeadline?: string;
    daysLeft?: number;
  };
  showRank?: boolean;
  showDeadline?: boolean;
}

function getRankBadge(rank: number) {
  if (rank >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800 border-green-300", icon: "🏆" };
  if (rank >= 75) return { label: "Very Good", color: "bg-blue-100 text-blue-800 border-blue-300", icon: "⭐" };
  if (rank >= 60) return { label: "Good", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: "✅" };
  if (rank >= 40) return { label: "Fair", color: "bg-orange-100 text-orange-800 border-orange-300", icon: "⚠️" };
  return { label: "Low", color: "bg-red-100 text-red-800 border-red-300", icon: "❌" };
}

function getLinkStatusBadge(status?: string) {
  if (status === "valid") return { label: "Verified Link", color: "bg-green-50 text-green-700 border-green-200", icon: "✓" };
  if (status === "broken") return { label: "Link Issue", color: "bg-red-50 text-red-700 border-red-200", icon: "✗" };
  return null;
}

function getDeadlineInfo(deadline?: string) {
  if (!deadline) return null;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Expired", color: "bg-red-100 text-red-800", urgent: true };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: "bg-red-100 text-red-800 animate-pulse", urgent: true };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: "bg-orange-100 text-orange-800", urgent: true };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: "bg-yellow-100 text-yellow-800", urgent: false };
  return { label: `${daysLeft}d left`, color: "bg-green-100 text-green-800", urgent: false };
}

export function OpportunityCard({ opportunity, showRank = true, showDeadline = true }: OpportunityCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const typeLabel = OPPORTUNITY_TYPE_LABELS[opportunity.type] || opportunity.type;
  const typeColor = OPPORTUNITY_TYPE_COLORS[opportunity.type] || "bg-gray-100 text-gray-800";
  const rankInfo = opportunity.overallRank ? getRankBadge(opportunity.overallRank) : null;
  const linkBadge = getLinkStatusBadge(opportunity.linkStatus);
  const deadlineInfo = showDeadline ? getDeadlineInfo(opportunity.applicationDeadline) : null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) checkBookmark(token);
  }, [opportunity.id]);

  async function checkBookmark(token: string) {
    try {
      const response = await fetch(`${API_URL}/bookmarks?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const exists = data.data?.some((b: any) => b.opportunityId === opportunity.id);
        setIsBookmarked(exists);
      }
    } catch {}
  }

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        // Find bookmark id and delete
        const response = await fetch(`${API_URL}/bookmarks?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const bookmark = data.data?.find((b: any) => b.opportunityId === opportunity.id);
          if (bookmark) {
            await fetch(`${API_URL}/bookmarks/${bookmark.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            setIsBookmarked(false);
          }
        }
      } else {
        await fetch(`${API_URL}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ opportunityId: opportunity.id }),
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    } finally {
      setBookmarkLoading(false);
    }
  }

  return (
    <Link href={`/opportunities/${opportunity.id}`} className="group block rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Top badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
              {typeLabel}
            </span>
            {opportunity.isRemote && <Badge variant="success">Remote</Badge>}
            {opportunity.isFeatured && <Badge variant="warning">Featured</Badge>}

            {/* Rank badge */}
            {showRank && rankInfo && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${rankInfo.color}`}>
                {rankInfo.icon} {rankInfo.label}
                {opportunity.overallRank && <span className="font-bold">({opportunity.overallRank})</span>}
              </span>
            )}

            {/* Link status */}
            {linkBadge && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${linkBadge.color}`}>
                {linkBadge.icon} {linkBadge.label}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {opportunity.title}
          </h3>

          {/* Organization */}
          {opportunity.organization && (
            <p className="mt-1 text-sm text-muted flex items-center gap-1">
              {opportunity.organization.name}
              {opportunity.organization.isVerified && (
                <span className="text-primary" title="Verified Organization">✓</span>
              )}
            </p>
          )}

          {/* Summary */}
          {opportunity.summary && (
            <p className="mt-2 text-sm text-muted line-clamp-2">
              {opportunity.summary}
            </p>
          )}

          {/* Deadline warning */}
          {deadlineInfo && (
            <div className={`mt-3 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${deadlineInfo.color}`}>
              {deadlineInfo.urgent && "🔥"} {deadlineInfo.label}
              {deadlineInfo.urgent && deadlineInfo.label !== "Expired" && " - Apply soon!"}
            </div>
          )}

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            {opportunity.salaryMin && opportunity.salaryMax && (
              <span className="flex items-center gap-1">
                💰 {opportunity.salaryCurrency || "ETB"} {opportunity.salaryMin.toLocaleString()} - {opportunity.salaryMax.toLocaleString()}
              </span>
            )}
            {opportunity.locations && opportunity.locations.length > 0 && (
              <span className="flex items-center gap-1">
                📍 {opportunity.locations[0].location.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {opportunity.tags.slice(0, 4).map(({ tag }, idx) => (
                <span key={tag.id || tag.name || idx} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tag.name}
                </span>
              ))}
              {opportunity.tags.length > 4 && (
                <span className="text-xs text-muted">+{opportunity.tags.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        {/* Bookmark button */}
        <button
          onClick={toggleBookmark}
          disabled={bookmarkLoading}
          className={`flex-shrink-0 rounded-lg p-2 transition-colors ${
            isBookmarked
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-gray-50 text-muted hover:bg-gray-100 hover:text-foreground"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this opportunity"}
        >
          <svg className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
