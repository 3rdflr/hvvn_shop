"use client";

import { useState } from "react";

/**
 * Fixed, scroll-independent background decoration. Fully self-contained — needs
 * no binary assets (the original bg.png / banner_animate.mp4 lived only in the
 * old Supabase bucket and are gone).
 *
 *  - Background: black base + a soft chrome radial glow + faint grid + vignette.
 *  - Calligraphy: local vertical "hvving" logo (public/images/hvving-vertical.png).
 *  - Corner orb: animated chrome wireframe (replaces the old corner video).
 */
export function SiteDecor() {
  const [calligraphyFailed, setCalligraphyFailed] = useState(false);

  return (
    <>
      {/* Background gradient + grid layer */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 50% at 50% -10%, rgba(220,220,228,0.10), transparent 60%)," +
              "radial-gradient(60% 40% at 100% 100%, rgba(160,170,200,0.06), transparent 60%)," +
              "#000000",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,220,228,0.6) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(220,220,228,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent 85%)",
            WebkitMaskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent 85%)",
          }}
        />
      </div>

      {/* Left-center vertical calligraphy */}
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

      {/* Corner brand video (bottom-right) — hvvn logo loop. mix-blend-screen keys
          out the black background. webm first, mp4 fallback. */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="pointer-events-none fixed bottom-3 right-3 md:bottom-5 md:right-5 w-16 md:w-24 z-0 opacity-90 mix-blend-screen"
      >
        <source src="/images/hvvn_video.webm" type="video/webm" />
        <source src="/images/hvvn_video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
