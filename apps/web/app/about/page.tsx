import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - OpportunityHub Ethiopia",
  description: "OpportunityHub Ethiopia is the #1 platform for discovering jobs, internships, scholarships, grants, and training opportunities across Ethiopia and beyond.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-foreground">About OpportunityHub</h1>
        <p className="mt-4 text-lg text-muted">
          Ethiopia&apos;s #1 Opportunity Platform — Empowering Careers, Always Free
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
          <p className="mt-4 text-muted leading-relaxed">
            OpportunityHub Ethiopia was created with one goal: to make it easy for every Ethiopian
            to discover life-changing opportunities. Whether you&apos;re looking for a job, an
            international scholarship, a grant for your startup, or a remote work position — we
            aggregate everything in one place and verify that every link works.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">🎯</div>
            <h3 className="mt-4 font-semibold text-foreground">Verified Links</h3>
            <p className="mt-2 text-sm text-muted">Every opportunity has a working application link and a valid deadline.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">🤖</div>
            <h3 className="mt-4 font-semibold text-foreground">Smart Matching</h3>
            <p className="mt-2 text-sm text-muted">Our algorithm ranks opportunities by quality, trust score, and relevance to you.</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">💚</div>
            <h3 className="mt-4 font-semibold text-foreground">100% Free</h3>
            <p className="mt-2 text-sm text-muted">No premium tiers. No hidden fees. Every feature is free forever.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">What We Aggregate</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "💼", label: "Jobs" },
              { emoji: "🎓", label: "Scholarships" },
              { emoji: "🏢", label: "Internships" },
              { emoji: "💰", label: "Grants" },
              { emoji: "🏆", label: "Competitions" },
              { emoji: "📚", label: "Training" },
              { emoji: "📅", label: "Events" },
              { emoji: "🤝", label: "Volunteer" },
              { emoji: "🌍", label: "Remote Work" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground">Our Sources</h2>
          <p className="mt-4 text-muted leading-relaxed">
            We aggregate opportunities from leading Ethiopian and international platforms including
            EthioJobs, UN Jobs, ReliefWeb, and many more. Our smart collector runs daily to find
            the latest opportunities and our validation engine checks every link to ensure it works.
          </p>
        </section>

        <section className="rounded-xl bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mt-2 text-muted">Browse thousands of verified opportunities today.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/opportunities" className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
              Browse Opportunities
            </Link>
            <Link href="/auth/register" className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
              Create Free Account
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
