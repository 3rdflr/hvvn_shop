"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Brand logo via next/image (auto-optimized → tiny WebP for the small header
 * render). Falls back to a gothic "hvving" wordmark if the asset is missing.
 */
export function BrandLogo({
  src,
  alt,
  className = "",
  fallbackClassName = "",
  vertical = false,
  width = 1400,
  height = 990,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  vertical?: boolean;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

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

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes="240px"
      priority
      onError={() => setFailed(true)}
    />
  );
}
