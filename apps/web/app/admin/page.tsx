"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const TYPE_LABELS: Record<string, string> = {
  JOB: "Jobs", SCHOLARSHIP: "Scholarships", INTERNSHIP: "Internships",
  GRANT: "Grants", COMPETITION: "Competitions", TRAINING: "Training",
  EVENT: "Events", VOLUNTEER: "Volunteer", REMOTE_WORK: "Remote Work",
};

const TYPE_COLORS: Record<string, string> = {
  JOB: "bg-blue-500", SCHOLARSHIP: "bg-purple-500", INTERNSHIP: "bg-green-500",
  GRANT: "bg-yellow-500", COMPETITION: "bg-red-500", TRAINING: "bg-indigo-500",
  EVENT: "bg-pink-500", VOLUNTEER: "bg-teal-500", REMOTE_WORK: "bg-cyan-500",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700", INACTIVE: "bg-gray-100 text-gray-700",
  ERROR: "bg-red-100 text-red-700", PENDING: "bg-yellow-100 text-yellow-700",
};

interface Stats {
  users: { total: number; byRole: { role: string; _count: { id: number } }[] };
  organizations: { total: number; verified: number };
  opportunities: { total: number; byType: { type: string; _count: { id: number } }[] };
  sources: { total: number; byStatus: { status: string; _count: { id: number } }[] };
  bookmarks: { total: number };
  recentAuditLogs: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "audit">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "ADMIN") {
      router.push("/auth/login");
      return;
    }
    fetchStats(token);
  }, []);

  async function fetchStats(token: string) {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      setStats(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers(token: string) {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchAuditLogs(token: string) {
    setAuditLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAuditLogs(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuditLoading(false);
    }
  }

  function handleTabChange(tab: "overview" | "users" | "audit") {
    setActiveTab(tab);
    const token = localStorage.getItem("token")!;
    if (tab === "users" && users.length === 0) fetchUsers(token);
    if (tab === "audit" && auditLogs.length === 0) fetchAuditLogs(token);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => router.push("/auth/login")} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const maxTypeCount = Math.max(...(stats?.opportunities.byType.map((t) => t._count.id) || [1]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-muted">Monitor and manage OpportunityHub</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-gray-50 p-1">
        {(["overview", "users", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "Overview" : tab === "users" ? "Users" : "Audit Logs"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard title="Total Opportunities" value={stats.opportunities.total} icon="📋" color="bg-blue-500" />
            <StatCard title="Total Users" value={stats.users.total} icon="👥" color="bg-green-500" />
            <StatCard title="Organizations" value={stats.organizations.total} icon="🏢" color="bg-purple-500" />
            <StatCard title="Bookmarks" value={stats.bookmarks.total} icon="🔖" color="bg-yellow-500" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Opportunities by Type</h3>
              <div className="space-y-3">
                {stats.opportunities.byType.sort((a, b) => b._count.id - a._count.id).map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{TYPE_LABELS[item.type] || item.type}</span>
                      <span className="text-muted">{item._count.id}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${TYPE_COLORS[item.type] || "bg-gray-400"}`}
                        style={{ width: `${(item._count.id / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Users by Role</h3>
              <div className="space-y-3">
                {stats.users.byRole.map((item) => (
                  <div key={item.role} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">{item.role.toLowerCase()}</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{item._count.id}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4 mt-8">Data Sources</h3>
              <div className="space-y-3">
                {stats.sources.byStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100"}`}>{item.status}</span>
                    <span className="text-sm text-muted">{item._count.id} / {stats.sources.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            {stats.recentAuditLogs.length === 0 ? (
              <p className="text-muted text-sm">No recent activity</p>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentAuditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center gap-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-muted">
                      {log.user?.firstName?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                        {" "}<span className="text-muted">{log.action.toLowerCase()}d</span>{" "}
                        <span className="text-muted">{log.entity}</span>
                      </p>
                      <p className="text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="rounded-xl border border-border bg-white">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">All Users ({users.length})</h3>
          </div>
          {usersLoading ? (
            <div className="p-8 text-center text-muted">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN" ? "bg-red-100 text-red-700" :
                          user.role === "MODERATOR" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>{user.isActive ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-muted">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "audit" && (
        <div className="rounded-xl border border-border bg-white">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Audit Logs ({auditLogs.length})</h3>
          </div>
          {auditLoading ? (
            <div className="p-8 text-center text-muted">Loading audit logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{log.user?.firstName} {log.user?.lastName}</p>
                        <p className="text-xs text-muted">{log.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          log.action === "CREATE" ? "bg-green-100 text-green-700" :
                          log.action === "DELETE" ? "bg-red-100 text-red-700" :
                          log.action === "LOGIN" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{log.action}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">{log.entity}</td>
                      <td className="px-6 py-4 text-sm text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-2xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
