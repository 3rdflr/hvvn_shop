"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the window is scrolled past `threshold` px.
 * Used by the header to switch from a transparent overlay (at the top, where
 * the decor should show through) to a solid bar (on scroll) — which removes
 * the awkward translucent empty band the old sticky header showed.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
