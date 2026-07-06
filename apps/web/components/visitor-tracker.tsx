"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        await fetch(`${API_URL}/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            userId: user.id || undefined,
            referrer: document.referrer || undefined,
          }),
        });
      } catch (error) {
        // Silent fail - analytics should never block user experience
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
