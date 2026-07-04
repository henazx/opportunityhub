import Link from "next/link";

const DOCS_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3001";

export function Footer() {
  return (
    <footer className="border-t border-border bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/opportunities" className="text-sm text-muted hover:text-primary">Browse Opportunities</Link></li>
              <li><Link href="/search" className="text-sm text-muted hover:text-primary">Search</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/opportunities?type=JOB" className="text-sm text-muted hover:text-primary">Jobs</Link></li>
              <li><Link href="/opportunities?type=INTERNSHIP" className="text-sm text-muted hover:text-primary">Internships</Link></li>
              <li><Link href="/opportunities?type=SCHOLARSHIP" className="text-sm text-muted hover:text-primary">Scholarships</Link></li>
              <li><Link href="/opportunities?type=GRANT" className="text-sm text-muted hover:text-primary">Grants</Link></li>
              <li><Link href="/opportunities?type=REMOTE_WORK" className="text-sm text-muted hover:text-primary">Remote Work</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-muted hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted hover:text-primary">Contact</Link></li>
              <li><a href={`${DOCS_URL}/docs`} target="_blank" className="text-sm text-muted hover:text-primary">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Connect</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="https://t.me/opportunityhub" target="_blank" className="text-sm text-muted hover:text-primary">Telegram</a></li>
              <li><a href="https://twitter.com/opportunityhub" target="_blank" className="text-sm text-muted hover:text-primary">Twitter</a></li>
              <li><a href="https://linkedin.com/company/opportunityhub" target="_blank" className="text-sm text-muted hover:text-primary">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white text-[10px] font-bold">OH</div>
            <span className="text-sm font-semibold text-foreground">OpportunityHub Ethiopia</span>
          </div>
          <p className="text-sm text-muted">
            🇪🇹 Built in Ethiopia &middot; Empowering Careers &middot; Always Free
          </p>
          <p className="mt-1 text-xs text-muted">&copy; {new Date().getFullYear()} OpportunityHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
