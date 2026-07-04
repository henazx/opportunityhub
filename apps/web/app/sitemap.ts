import type { MetadataRoute } from "next";

const BASE_URL = "https://opportunityhub.et";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface SitemapOpportunity {
  id: string;
  updatedAt: string;
}

async function getOpportunities(): Promise<SitemapOpportunity[]> {
  try {
    const res = await fetch(`${API_URL}/opportunities?limit=500&verifiedOnly=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((o: any) => ({
      id: o.id,
      updatedAt: o.updatedAt || o.importedAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opportunities = await getOpportunities();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/opportunities`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const opportunityPages: MetadataRoute.Sitemap = opportunities.map((opp) => ({
    url: `${BASE_URL}/opportunities/${opp.id}`,
    lastModified: new Date(opp.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...opportunityPages];
}
