"use client";

import { useState } from "react";

/**
 * Renders a brand logo image, falling back to a styled gothic wordmark
 * if the asset is missing (so the site looks intentional before the
 * artist drops the real PNGs into the site-assets bucket).
 */
export function BrandLogo({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  vertical = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  vertical?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  // No asset configured (or it failed to load) → clean gothic wordmark, never a broken image.
  if (failed || !src) {
    return (
      <span
        className={`font-gothic chrome-text select-none ${
          vertical ? "[writing-mode:vertical-rl] tracking-widest" : "tracking-tight"
        } ${fallbackClassName}`}
      >
        hvving
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
