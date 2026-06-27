"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "@/lib/api/storefront";
import { YouTubeBackground } from "@/components/layouts/youtube-background";

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
 *    chrome↔black glow.
 *  - Calligraphy + corner video: shown on all pages.
 */
export function SiteDecor() {
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
        {/* Base: animated chrome↔black glow (always). The video fades in over it. */}
        <div
          className="bg-chrome-shift absolute inset-[-10%]"
          style={{
            background:
              "radial-gradient(90% 70% at 50% 25%, rgba(220,220,228,1), transparent 70%)," +
              "radial-gradient(80% 70% at 20% 90%, rgba(170,180,210,0.8), transparent 70%)," +
              "radial-gradient(80% 70% at 90% 60%, rgba(150,160,195,0.7), transparent 70%)",
          }}
        />
        {ytId && <YouTubeBackground id={ytId} />}
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

      {/* Left-center vertical calligraphy — all pages */}
      {!calligraphyFailed && (
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
        className="pointer-events-none fixed bottom-3 right-3 md:bottom-5 md:right-5 w-16 md:w-24 z-[60] opacity-90 mix-blend-screen"
      >
        <source src="/images/hvvn_video.webm" type="video/webm" />
        <source src="/images/hvvn_video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
