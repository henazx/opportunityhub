"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/search", label: "Search" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground leading-tight">OpportunityHub</span>
            <span className="text-[10px] text-primary font-medium leading-tight hidden sm:block">Ethiopia&apos;s #1 Opportunity Platform</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
              >
                <span className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
                <span className="hidden sm:inline">{user.firstName}</span>
                <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white shadow-lg z-50 py-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground" onClick={() => setDropdownOpen(false)}>
                        📊 Dashboard
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground" onClick={() => setDropdownOpen(false)}>
                        👤 My Profile
                      </Link>
                      <Link href="/dashboard/cv" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground" onClick={() => setDropdownOpen(false)}>
                        📄 Generate CV
                      </Link>
                      <Link href="/dashboard/bookmarks" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground" onClick={() => setDropdownOpen(false)}>
                        🔖 Bookmarks
                      </Link>
                      <Link href="/dashboard/applications" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-gray-50 hover:text-foreground" onClick={() => setDropdownOpen(false)}>
                        📋 Applications
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => { handleLogout(); setDropdownOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-muted hover:text-primary transition-colors">Sign In</Link>
              <Link href="/auth/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Join Free</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-muted hover:text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="border-t border-border mt-2 pt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <Link href="/dashboard" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                    📊 Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link href="/dashboard/cv" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                    📄 Generate CV
                  </Link>
                  <Link href="/dashboard/bookmarks" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                    🔖 Bookmarks
                  </Link>
                  <Link href="/dashboard/applications" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 hover:text-primary" onClick={() => setMobileOpen(false)}>
                    📋 Applications
                  </Link>
                </div>
                <div className="border-t border-border mt-2 pt-2">
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-border mt-2 pt-2 space-y-1">
                <Link href="/auth/login" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link href="/auth/register" className="block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-white" onClick={() => setMobileOpen(false)}>Join Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
