"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored) setUser(JSON.parse(stored));
    if (token) fetchDashboard(token);
    else setLoading(false);
  }, []);

  async function fetchDashboard(token: string) {
    try {
      const response = await fetch(`${API_URL}/dashboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setStats(await response.json());
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName || "there"}!</h1>
        <p className="mt-2 text-muted">Manage your opportunities and track your progress</p>
      </div>

      {/* Account Features */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Account Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/profile" className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="text-2xl mb-2">👤</div>
            <div className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">My Profile</div>
            <div className="mt-1 text-sm text-muted">Fill in your CV details</div>
          </Link>
          <Link href="/dashboard/cv" className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="text-2xl mb-2">📄</div>
            <div className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">Generate CV</div>
            <div className="mt-1 text-sm text-muted">Download your professional CV</div>
          </Link>
          <Link href="/dashboard/bookmarks" className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="text-2xl mb-2">🔖</div>
            <div className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">Bookmarks</div>
            <div className="mt-1 text-sm text-muted">Organize saved opportunities</div>
          </Link>
          <Link href="/dashboard/applications" className="group rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">Applications</div>
            <div className="mt-1 text-sm text-muted">Track your application status</div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="text-sm text-muted">Saved Opportunities</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : stats?.bookmarkCount || 0}</div>
          <Link href="/dashboard/bookmarks" className="mt-3 inline-block text-sm text-primary hover:underline">View saved →</Link>
        </div>
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="text-sm text-muted">Recent Searches</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{loading ? "..." : stats?.recentSearches?.length || 0}</div>
          <Link href="/search" className="mt-3 inline-block text-sm text-primary hover:underline">Search more →</Link>
        </div>
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="text-sm text-muted">Account</div>
          <div className="mt-2 text-lg font-medium text-foreground capitalize">{user?.role || "User"}</div>
          <p className="mt-1 text-sm text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Recently Saved */}
      {stats?.savedOpportunities && stats.savedOpportunities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground">Recently Saved</h2>
          <div className="mt-4 space-y-3">
            {stats.savedOpportunities.map((item: any) => (
              <Link key={item.id} href={`/opportunities/${item.opportunity.id}`} className="block rounded-xl border border-border bg-white p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{item.opportunity.title}</div>
                    <div className="text-sm text-muted">{item.opportunity.organization?.name}</div>
                  </div>
                  <span className="text-xs text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
