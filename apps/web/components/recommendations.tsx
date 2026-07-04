"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface RecommendationSection {
  title: string;
  subtitle: string;
  opportunities: any[];
}

export function Recommendations() {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRecommendations(); }, []);

  async function fetchRecommendations(retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/validation/recommendations`, { headers });

        if (response.ok) {
          const data = await response.json();
          const newSections: RecommendationSection[] = [];

          if (data.personalized?.length > 0) {
            newSections.push({
              title: "💡 Recommended for You",
              subtitle: "Based on your interests and activity",
              opportunities: data.personalized,
            });
          }

          if (data.topRanked?.length > 0) {
            newSections.push({
              title: "🏆 Top Ranked Opportunities",
              subtitle: "Highest trust and quality scores",
              opportunities: data.topRanked,
            });
          }

          if (data.deadlineOpps?.length > 0) {
            const urgent = data.deadlineOpps.filter((o: any) => o.daysLeft !== null && o.daysLeft <= 7);
            if (urgent.length > 0) {
              newSections.push({
                title: "🔥 Closing Soon",
                subtitle: "Apply before these deadlines pass",
                opportunities: urgent,
              });
            }
          }

          if (data.verifiedOpps?.length > 0) {
            newSections.push({
              title: "✅ Verified Organizations",
              subtitle: "Opportunities from trusted sources",
              opportunities: data.verifiedOpps,
            });
          }

          if (data.freshOpps?.length > 0) {
            newSections.push({
              title: "🆕 Recently Added",
              subtitle: "Fresh opportunities just posted",
              opportunities: data.freshOpps,
            });
          }

          setSections(newSections);
          setLoading(false);
          return;
        }
      } catch (error) {
        if (attempt === retries) {
          console.error("Failed to fetch recommendations after retries:", error);
        } else {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <section key={section.title} className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
              <p className="mt-1 text-sm text-muted">{section.subtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.opportunities.slice(0, 6).map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} showRank showDeadline />
              ))}
            </div>

            {section.opportunities.length > 6 && (
              <div className="mt-4 text-center">
                <Link href="/opportunities" className="text-sm font-medium text-primary hover:underline">
                  View all {section.opportunities.length} opportunities →
                </Link>
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
