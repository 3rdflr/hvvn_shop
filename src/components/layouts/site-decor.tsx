"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "@/lib/api/storefront";

/** Extract a YouTube video id from common URL shapes. */
function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

/**
 * Fixed background decoration.
 *  - Background (behind content): admin-set YouTube music video, else an animated
 *    chrome↔black glow. Never covers content.
 *  - Calligraphy: only on the home page (it overlays content, so it's hidden
 *    elsewhere to keep product info readable).
 *  - Corner brand video: all pages.
 */
export function SiteDecor() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [calligraphyFailed, setCalligraphyFailed] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000,
  });
  const ytId = youtubeId(settings?.bg_youtube_url);

  return (
    <>
      {/* Background layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
      >
        {ytId ? (
          <>
            <iframe
              title="background"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0`}
              allow="autoplay; encrypted-media"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
            />
            <div className="absolute inset-0 bg-black/65" />
          </>
        ) : (
          <div
            className="bg-chrome-shift absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 30% 20%, rgba(220,220,228,0.9), transparent 60%)," +
                "radial-gradient(55% 45% at 80% 80%, rgba(160,170,200,0.6), transparent 60%)",
            }}
          />
        )}
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,220,228,0.6) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(220,220,228,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(70% 60% at 50% 40%, black, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(70% 60% at 50% 40%, black, transparent 85%)",
          }}
        />
      </div>

      {/* Left-center vertical calligraphy — home page only */}
      {isHome && !calligraphyFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/hvving-vertical.png"
          alt=""
          aria-hidden
          onError={() => setCalligraphyFailed(true)}
          className="pointer-events-none select-none fixed left-0 md:left-6 top-1/2 -translate-y-1/2 -translate-x-[32%] md:translate-x-0 h-[40vh] md:h-[66vh] w-auto object-contain z-[60] opacity-50 md:opacity-60"
        />
      )}

      {/* Corner brand video (bottom-right) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="pointer-events-none fixed bottom-3 right-3 md:bottom-5 md:right-5 w-16 md:w-24 z-60 opacity-90 mix-blend-screen"
      >
        <source src="/images/hvvn_video.webm" type="video/webm" />
        <source src="/images/hvvn_video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
