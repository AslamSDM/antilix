"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/providers/loading-provider";

/**
 * A hook to trigger loading state on route changes
 * This adds a nice loading animation when navigating between pages
 */
export function useNavigationLoading(options = { enabled: true }) {
  const { startLoading, completeLoading } = useLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!options.enabled) return;

    // Start loading on route change
    startLoading();

    // Set a random loading time that feels natural (between 0.5s and 1.2s)
    const loadingTime = Math.random() * 700 + 500;

    const timer = setTimeout(() => {
      completeLoading();
    }, loadingTime);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, startLoading, completeLoading, options.enabled]);
}
