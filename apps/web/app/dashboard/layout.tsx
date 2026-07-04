"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/profile", label: "My Profile", icon: "👤" },
  { href: "/dashboard/cv", label: "Generate CV", icon: "📄" },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: "🔖" },
  { href: "/dashboard/applications", label: "Applications", icon: "📋" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/auth/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* User info */}
              <div className="rounded-xl border border-border bg-white p-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="rounded-xl border border-border bg-white overflow-hidden">
                {SIDEBAR_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/5 text-primary border-l-2 border-primary"
                        : "text-muted hover:bg-gray-50 hover:text-foreground"
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Back + Logout */}
              <div className="mt-4 space-y-2">
                <Link href="/" className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors">
                  ← Back to Home
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                  🚪 Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed bottom-4 left-4 z-40">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-full bg-primary text-white p-3 shadow-lg hover:bg-primary-hover"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted hover:text-foreground">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {SIDEBAR_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          pathname === link.href
                            ? "bg-primary/5 text-primary"
                            : "text-muted hover:bg-gray-50 hover:text-foreground"
                        }`}
                      >
                        <span>{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-border space-y-1">
                    <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-gray-50">
                      ← Back to Home
                    </Link>
                    <button onClick={() => { handleLogout(); setSidebarOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
