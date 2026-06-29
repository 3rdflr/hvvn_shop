"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/api/storefront";
import { useUi } from "@/store/ui";

/**
 * Samples a small canvas of the image to get its average (dominant-ish) color,
 * used to tint the viewer background. Needs CORS (Supabase public objects send
 * it); on a tainted canvas it just returns null and the tint stays off.
 */
function useDominantColor(url?: string): string | null {
  const [color, setColor] = useState<string | null>(null);
  useEffect(() => {
    if (!url) {
      setColor(null);
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = 24;
        const h = 24;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const d = ctx.getImageData(0, 0, w, h).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3]! < 128) continue; // skip transparent pixels
          r += d[i]!;
          g += d[i + 1]!;
          b += d[i + 2]!;
          n++;
        }
        if (!n || cancelled) return;
        setColor(`rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`);
      } catch {
        /* tainted canvas — leave tint off */
      }
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);
  return color;
}

/**
 * Full-screen portfolio experience launched from the business card. One main
 * image stands on the rotating floor; left/right swap it with a blur/fade. The
 * background is tinted by the current image's dominant color. Clicking the image
 * toggles a Y2K-chrome detail modal. Reuses the public /api/portfolio read.
 */
export function PortfolioViewer() {
  const open = useUi((s) => s.portfolioOpen);
  const close = useUi((s) => s.closePortfolio);
  const { data, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const items = data?.items ?? [];
  const count = items.length;

  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const prev = useCallback(() => {
    if (count) setIndex((i) => (i - 1 + count) % count);
  }, [count]);
  const next = useCallback(() => {
    if (count) setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);
  useEffect(() => {
    setDetails(false);
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (details ? setDetails(false) : close());
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, details, close, prev, next]);

  const bgColor = useDominantColor(items[index]?.main_url);

  // ---- auto-advance every 5s (paused while reading details / hovering) ----
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = details || hover !== null;
  }, [details, hover]);
  useEffect(() => {
    if (!open || count < 2) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) next();
    }, 5000);
    return () => window.clearInterval(id);
  }, [open, count, next]);

  if (!open) return null;

  const item = items[index];

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {/* Background tinted by the current image's dominant color. */}
      <div
        className="absolute inset-0 transition-[background-color,opacity] duration-700"
        style={{ backgroundColor: bgColor ?? "transparent", opacity: bgColor ? 0.5 : 0 }}
      />
      {/* Vignette for depth. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85" />

      {/* Close */}
      <button
        type="button"
        onClick={close}
        aria-label="닫기"
        className="absolute top-4 right-4 z-30 p-2 text-chrome/80 hover:text-chrome transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="eyebrow absolute top-5 left-5 z-30">— Portfolio</div>

      {/* Stage */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        {isLoading && <p className="text-sm text-muted">불러오는 중…</p>}
        {!isLoading && count === 0 && (
          <p className="text-sm text-muted">포트폴리오가 준비 중입니다.</p>
        )}

        {item && (
          <>
            {/* A$AP-style 3D motion collage: one turntable group (floor + upright
                subjects) spins together. Floor lies flat; main/background stand on
                it at admin-set X positions and orbit with the rotation. */}
            <div className="portfolio-stage absolute inset-0">
              <div
                className={`portfolio-group absolute left-1/2 top-[60%] ${details ? "is-paused" : ""}`}
              >
                {/* Turntable floor */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hvvn_bottom.png"
                  alt=""
                  className="portfolio-floor pointer-events-none absolute left-0 top-0 w-[min(680px,80vw)] max-w-none select-none"
                  draggable={false}
                />

                {/* Single main subject standing on the floor; keyed so each
                    prev/next swap replays the enter interaction. */}
                <Standee
                  key={item.id}
                  src={item.main_url}
                  heightClass="h-[34vh] max-h-[340px]"
                  onClick={() => setDetails((v) => !v)}
                  onHover={(x, y) => setHover({ x, y })}
                  onLeave={() => setHover(null)}
                  label={`${item.title} 상세 보기`}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center">
              <div className="chrome-text text-xl">{item.title}</div>
              <div className="text-[11px] tracking-widest2 uppercase text-muted mt-1">
                {[item.type, item.work_date].filter(Boolean).join(" · ")}
                {count > 1 && ` · ${index + 1}/${count}`}
              </div>
              <button
                type="button"
                onClick={() => setDetails(true)}
                className="btn-ghost px-0 underline mt-2"
              >
                상세 보기
              </button>
            </div>

            {/* Prev / Next */}
            {count > 1 && (
              <>
                <NavArrow side="left" onClick={prev} />
                <NavArrow side="right" onClick={next} />
              </>
            )}
          </>
        )}
      </div>

      {/* Cursor-following hover peek (desktop) — quick info without clicking. */}
      {hover && item && !details && (
        <div
          className="pointer-events-none fixed z-40 w-64 max-w-[70vw]"
          style={{
            left: Math.min(hover.x + 18, (typeof window !== "undefined" ? window.innerWidth : 9999) - 270),
            top: hover.y + 18,
          }}
        >
          <div className="border border-chrome/40 bg-black/85 backdrop-blur-sm px-3 py-2">
            <div className="chrome-text text-base leading-tight">{item.title}</div>
            {(item.type || item.work_date) && (
              <div className="text-[10px] tracking-widest2 uppercase text-muted mt-0.5">
                {[item.type, item.work_date].filter(Boolean).join(" · ")}
              </div>
            )}
            {item.content && (
              <p className="text-xs text-ink/80 mt-1.5 line-clamp-3 whitespace-pre-wrap">
                {item.content}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Detail modal — Y2K chrome */}
      {details && item && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-5">
          <div onClick={() => setDetails(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-[min(560px,100%)] max-h-[82vh] overflow-y-auto p-[1.5px] rounded-2xl bg-gradient-to-br from-chrome/80 via-chrome/20 to-chrome/70">
            <div className="rounded-2xl bg-black/95 p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setDetails(false)}
                aria-label="닫기"
                className="absolute top-4 right-4 text-chrome/70 hover:text-chrome transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <div className="eyebrow mb-2">
                {[item.type, item.work_date].filter(Boolean).join(" · ") || "—"}
              </div>
              <h2 className="chrome-text text-3xl mb-4">{item.title}</h2>
              {item.content ? (
                <p className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">{item.content}</p>
              ) : (
                <p className="text-sm text-muted">상세 내용이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** An upright subject standing on the turntable (centered), lifted slightly off the floor. */
function Standee({
  src,
  heightClass,
  onClick,
  onHover,
  onLeave,
  label,
}: {
  src: string;
  heightClass: string;
  onClick: () => void;
  onHover?: (x: number, y: number) => void;
  onLeave?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover?.(e.clientX, e.clientY)}
      onPointerMove={(e) => e.pointerType === "mouse" && onHover?.(e.clientX, e.clientY)}
      onPointerLeave={() => onLeave?.()}
      aria-label={label}
      className="portfolio-standee standee-enter absolute left-0 top-0 block focus:outline-none"
      style={{ transform: "translate(-50%, -100%) translateY(-40px)", transformOrigin: "bottom center" }}
    >
      {/* plain img preserves gif animation (next/image would freeze it) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label ?? ""}
        className={`${heightClass} w-auto max-w-none select-none drop-shadow-[0_26px_44px_rgba(0,0,0,0.6)]`}
        draggable={false}
      />
    </button>
  );
}

function NavArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "이전" : "다음"}
      className={`absolute top-1/2 -translate-y-1/2 z-20 ${
        side === "left" ? "left-2 sm:left-5" : "right-2 sm:right-5"
      } p-2 text-chrome/70 hover:text-chrome transition focus:outline-none`}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {side === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
