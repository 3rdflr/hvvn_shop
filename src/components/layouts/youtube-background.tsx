"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type YTPlayer = {
  mute: () => void;
  playVideo: () => void;
  destroy: () => void;
};
type YTPlayerEvent = { target: YTPlayer; data?: number };
type YTNamespace = {
  Player: new (
    el: Element,
    opts: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: YTPlayerEvent) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Muted, looping, controls-free YouTube background.
 *
 * Reveal sequence: load → mute()+playVideo() → wait for the real PLAYING state
 * (so the start-up overlay/play button is already gone) → THEN fade in from the
 * chrome↔black glow underneath. On later route changes the player is already
 * playing, so it just re-fades quickly.
 *
 * The player is non-interactive and sits behind page content, so YouTube never
 * gets hover → the centred play / prev-next overlays never appear. It's oversized
 * + scaled so the title bar / controls sit off-screen.
 */
export function YouTubeBackground({ id }: { id: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const hasPlayedRef = useRef(false);
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Create the player once.
  useEffect(() => {
    let cancelled = false;

    const reveal = () => {
      if (hasPlayedRef.current) return; // reveal once; route changes handle re-fades
      hasPlayedRef.current = true;
      // generous grace so YouTube's start-up play button is fully gone first
      setTimeout(() => !cancelled && setReady(true), 5000);
    };

    const createPlayer = () => {
      if (cancelled || !targetRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(targetRef.current, {
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: id,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            if (!window.YT) return;
            if (e.data === window.YT.PlayerState.PLAYING) reveal();
            else if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo();
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
    }

    // Fallback: first user gesture forces play if a browser hard-blocks autoplay.
    const onGesture = () => {
      try {
        playerRef.current?.playVideo();
      } catch {
        /* noop */
      }
    };
    const events = ["pointerdown", "touchstart", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onGesture));
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
    };
  }, [id]);

  // Re-fade on every route change once the video has played at least once.
  useEffect(() => {
    if (!hasPlayedRef.current) return;
    setReady(false);
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ease-out",
        ready ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full scale-[1.6]">
        <div ref={targetRef} className="h-full w-full" />
      </div>
      {/* Dim + transparent shield over the player. */}
      <div className="absolute inset-0 bg-black/65" />
    </div>
  );
}
