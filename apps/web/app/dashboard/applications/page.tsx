"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  SAVED: { label: "Saved", color: "text-gray-700", bg: "bg-gray-100", icon: "🔖" },
  APPLIED: { label: "Applied", color: "text-blue-700", bg: "bg-blue-100", icon: "📤" },
  INTERVIEWING: { label: "Interviewing", color: "text-purple-700", bg: "bg-purple-100", icon: "🎤" },
  OFFERED: { label: "Offered", color: "text-green-700", bg: "bg-green-100", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-100", icon: "❌" },
  ACCEPTED: { label: "Accepted", color: "text-green-700", bg: "bg-green-100", icon: "✅" },
  WITHDRAWN: { label: "Withdrawn", color: "text-yellow-700", bg: "bg-yellow-100", icon: "↩️" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) { router.push("/auth/login"); return; }
    setUser(JSON.parse(storedUser));
    fetchApplications(token);
  }, [router]);

  async function fetchApplications(token: string) {
    try {
      const [appsRes, countsRes] = await Promise.all([
        fetch(`${API_URL}/applications?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/applications/statuses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.data || []);
      }
      if (countsRes.ok) {
        const counts = await countsRes.json();
        const map: Record<string, number> = {};
        counts.forEach((c: any) => { map[c.status] = c.count; });
        setStatusCounts(map);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem("token");
    try {
      const body: any = { status };
      if (status === "APPLIED") body.appliedAt = new Date().toISOString();
      if (status === "INTERVIEWING") body.interviewAt = new Date().toISOString();

      await fetch(`${API_URL}/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      fetchApplications(token!);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  async function removeApplication(id: string) {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(applications.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to remove application:", error);
    }
  }

  const filtered = activeStatus === "ALL" ? applications : applications.filter((a) => a.status === activeStatus);

  function getTypeIcon(type: string) {
    const icons: Record<string, string> = { JOB: "💼", SCHOLARSHIP: "📚", INTERNSHIP: "🎓", GRANT: "💰", TRAINING: "⚙️", VOLUNTEER: "🤝", REMOTE_WORK: "🌍" };
    return icons[type] || "📋";
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Application Tracker</h1>
        <p className="mt-2 text-muted">Track your applications from saved to accepted</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-lg border border-border bg-white p-3 text-center">
          <div className="text-lg font-bold text-foreground">{applications.length}</div>
          <div className="text-xs text-muted">Total</div>
        </div>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="rounded-lg border border-border bg-white p-3 text-center">
            <div className="text-lg font-bold text-foreground">{statusCounts[key] || 0}</div>
            <div className="text-xs text-muted">{config.label}</div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveStatus("ALL")}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeStatus === "ALL" ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          All ({applications.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveStatus(key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeStatus === key ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
          >
            {config.icon} {config.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-foreground">
            {activeStatus === "ALL" ? "No Applications Yet" : `No ${STATUS_CONFIG[activeStatus]?.label} Applications`}
          </h2>
          <p className="mt-2 text-muted">Browse opportunities and start tracking your applications.</p>
          <Link href="/opportunities" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover">
            Browse Opportunities →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.SAVED;
            return (
              <div key={app.id} className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(app.opportunity.type)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <Link href={`/opportunities/${app.opportunity.id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                      {app.opportunity.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{app.opportunity.organization?.name}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                      {app.appliedAt && <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>}
                      {app.interviewAt && <span>Interview: {new Date(app.interviewAt).toLocaleDateString()}</span>}
                      {app.opportunity.applicationDeadline && (
                        <span>Deadline: {new Date(app.opportunity.applicationDeadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    {app.notes && <p className="mt-2 text-sm text-muted italic">📝 {app.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="rounded-lg border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeApplication(app.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
