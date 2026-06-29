"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { HeaderMenu } from "./header-menu";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/utils";

/**
 * Scroll-aware sticky header.
 *
 * Fixes the old "empty translucent band" defect: previously the header was a
 * permanent `bg-black/70` strip with a blank left grid cell, so the gap was
 * always visible — and most obvious mid-scroll. Now the bar is transparent and
 * borderless at the very top (decor shows through, no visible band), and only
 * materialises into a solid bar with a hairline once you start scrolling.
 */
export function SiteHeader() {
  const scrolled = useScrolled(8);
  // Horizontal brand logo (public/images). Empty string → gothic "hvving" wordmark.
  const headerLogo = "/images/hvvn_header.png";

  return (
    <header className="sticky top-0 z-40">
      {/* Background as a separate opacity-faded layer (incl. its backdrop-blur and
          hairline border) so scrolling up/down never snaps the bar in/out — the
          old version toggled bg + blur instantly, which read as a seam at the top. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 border-b border-line bg-black/95 backdrop-blur-md transition-opacity duration-300 will-change-[opacity]",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Height matches the original design (h-16 / md:h-12). */}
      <div className="container-page relative h-16 md:h-12 grid grid-cols-[1fr_auto_1fr] items-center">
        <div aria-hidden />
        <div className="flex justify-center overflow-visible">
          <Link href="/" aria-label="hvving home" className="flex items-center">
            <BrandLogo
              src={headerLogo}
              alt="hvving"
              className="h-8 md:h-9 w-auto object-contain"
              fallbackClassName="text-lg"
            />
          </Link>
        </div>
        <div className="flex items-center justify-end">
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}
