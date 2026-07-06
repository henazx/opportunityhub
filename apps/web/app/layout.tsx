import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VisitorTracker } from "@/components/visitor-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpportunityHub Ethiopia — Verified Jobs, Scholarships & Grants",
    template: "%s | OpportunityHub Ethiopia",
  },
  description:
    "Ethiopia's #1 free opportunity platform. Browse 10,000+ verified jobs, internships, scholarships, grants, training, and remote work. Every link checked, every opportunity ranked.",
  keywords: [
    "Ethiopia jobs",
    "Ethiopia scholarships",
    "Ethiopia internships",
    "Ethiopia grants",
    "Addis Ababa jobs",
    "remote work Ethiopia",
    "NGO jobs Ethiopia",
    "Ethiopian Airlines jobs",
    "scholarships for Ethiopians",
    "verified opportunities",
    "job search Ethiopia",
    "training programs Ethiopia",
    "volunteer opportunities Ethiopia",
  ],
  authors: [{ name: "OpportunityHub" }],
  creator: "OpportunityHub",
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: "https://opportunityhub.et",
    siteName: "OpportunityHub Ethiopia",
    title: "OpportunityHub Ethiopia — Verified Jobs, Scholarships & Grants",
    description:
      "Ethiopia's #1 free opportunity platform. Browse 10,000+ verified jobs, internships, scholarships, grants, and remote work.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "OpportunityHub Ethiopia — Verified Opportunities Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpportunityHub Ethiopia — Verified Jobs, Scholarships & Grants",
    description:
      "Ethiopia's #1 free opportunity platform. Every link checked, every opportunity ranked.",
    images: ["https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&h=630&fit=crop"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://opportunityhub.et",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <VisitorTracker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
