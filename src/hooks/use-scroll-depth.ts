"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the user has scrolled past `fraction` (0–1) of the page.
 * Latches true and stops listening. Short pages that can't scroll fall back to a
 * dwell timer so the trigger still fires for "viewed enough".
 */
export function useScrollDepth(fraction = 0.6, shortPageDelayMs = 12000): boolean {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    if (reached) return;

    const scrollable = () => document.documentElement.scrollHeight - window.innerHeight;

    const onScroll = () => {
      const max = scrollable();
      if (max > 200 && window.scrollY / max >= fraction) setReached(true);
    };

    // Fallback for pages too short to scroll to depth.
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (scrollable() <= 200) {
      timer = setTimeout(() => setReached(true), shortPageDelayMs);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [fraction, shortPageDelayMs, reached]);

  return reached;
}
