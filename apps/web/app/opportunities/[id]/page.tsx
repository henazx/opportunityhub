import type { Metadata } from "next";
import { OpportunityDetailClient } from "@/components/opportunity/opportunity-detail-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const BASE_URL = "https://opportunityhub.et";

async function getOpportunity(id: string) {
  try {
    const res = await fetch(`${API_URL}/opportunities/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const opportunity = await getOpportunity(id);

  if (!opportunity) {
    return {
      title: "Opportunity Not Found",
      description: "This opportunity could not be found on OpportunityHub Ethiopia.",
      robots: { index: false },
    };
  }

  const orgName = opportunity.organization?.name || "";
  const typeLabel = opportunity.type?.replace("_", " ").toLowerCase() || "opportunity";
  const title = `${opportunity.title}${orgName ? ` at ${orgName}` : ""}`;
  const description =
    opportunity.summary ||
    opportunity.description?.slice(0, 160) ||
    `${opportunity.title} — ${typeLabel} opportunity on OpportunityHub Ethiopia. Verified link, ranked and scored.`;

  const location =
    opportunity.locations?.length > 0
      ? opportunity.locations.map((l: any) => l.location.name).join(", ")
      : "Ethiopia";

  const salary =
    opportunity.salaryMin && opportunity.salaryMax
      ? `. Salary: ${opportunity.salaryCurrency || "ETB"} ${opportunity.salaryMin.toLocaleString()} - ${opportunity.salaryMax.toLocaleString()}`
      : "";

  const deadline = opportunity.applicationDeadline
    ? `. Deadline: ${new Date(opportunity.applicationDeadline).toLocaleDateString("en-ET", { year: "numeric", month: "long", day: "numeric" })}`
    : "";

  const fullDescription = `${description}${salary}${deadline}. Location: ${location}. Apply now on OpportunityHub Ethiopia — Ethiopia's #1 verified opportunity platform.`;

  return {
    title,
    description: fullDescription.slice(0, 300),
    keywords: [
      opportunity.title,
      orgName,
      typeLabel,
      "Ethiopia",
      location,
      "verified opportunity",
      "OpportunityHub",
    ],
    openGraph: {
      type: "article",
      url: `${BASE_URL}/opportunities/${id}`,
      title,
      description: fullDescription.slice(0, 300),
      siteName: "OpportunityHub Ethiopia",
      authors: [orgName].filter(Boolean),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: fullDescription.slice(0, 300),
    },
    alternates: {
      canonical: `${BASE_URL}/opportunities/${id}`,
    },
  };
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return <OpportunityDetailClient />;
}
