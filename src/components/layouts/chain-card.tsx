"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/store/ui";

const CHAIN_BG = {
  // Seamless 2-link tile cropped from hvvn_chain.png (tiles vertically with no seam).
  backgroundImage: "url(/images/hvvn_chain_tile.webp)",
  backgroundRepeat: "repeat-y",
  backgroundSize: "100% auto",
  backgroundPosition: "top center",
} as const;

/**
 * Info button (top-left) → modal: a chain descends from the top-center with a
 * large business card hanging from it, surroundings blurred. The card tilts
 * toward the cursor like a holo trading card; clicking flips it to the back →
 * Contact / Portfolio. Backdrop click closes.
 */
export function ChainCard() {
  const openContact = useUi((s) => s.openContact);
  const openPortfolio = useUi((s) => s.openPortfolio);
  const open = useUi((s) => s.cardOpen);
  const closeCard = useUi((s) => s.closeCard);

  const [shown, setShown] = useState(false); // entrance ("drop") transition
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [tilting, setTilting] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const t = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    closeCard();
    setFlipped(false);
    resetTilt();
  }

  // ---- card tilt / flip ----
  function onCardMove(e: React.PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilting(true);
    setTilt({ x: -py * 16, y: px * 20 });
  }
  function resetTilt() {
    setTilting(false);
    setTilt({ x: 0, y: 0 });
  }

  return (
    <>
      {/* Trigger lives in the header (InfoButton); this component only renders the modal. */}
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center">
          {/* Blurred backdrop — click to close */}
          <div
            onClick={close}
            className={`absolute inset-0 bg-black/55 backdrop-blur-md transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
          />

          {/* Centered chain + card, dropping from the top */}
          <div
            className="relative z-[1] flex flex-col items-center"
            style={{
              touchAction: "none",
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(-70px)",
              transition:
                "transform 620ms cubic-bezier(0.34,1.56,0.64,1), opacity 320ms ease-out",
            }}
          >
            {/* Long chain from the top */}
            <div
              className="w-[18px] -mb-1"
              style={{
                ...CHAIN_BG,
                height: shown ? "30vh" : "0px",
                transition: "height 600ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
              aria-hidden
            />

            <div className="[perspective:1200px]">
              <div
                onPointerMove={onCardMove}
                onPointerLeave={resetTilt}
                onClick={() => {
                  setTilting(false);
                  setFlipped((v) => !v);
                }}
                className="relative w-[min(680px,92vw)] aspect-[1063/591] cursor-pointer [transform-style:preserve-3d]"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
                  transitionProperty: "transform",
                  transitionDuration: tilting ? "0ms" : "420ms",
                  transitionTimingFunction: "ease-out",
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hvvn_card.png"
                    alt="hvvn 명함"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`,
                    }}
                  />
                </div>

                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hvvn_card_empty.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="relative h-full w-full flex flex-col items-center justify-center gap-3 bg-black/40">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openContact();
                      }}
                      className="w-40 max-w-[60%] text-center border border-chrome/70 bg-black/40 text-chrome text-[13px] tracking-widest2 uppercase py-2.5 hover:bg-chrome hover:text-black transition"
                    >
                      Contact
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPortfolio();
                      }}
                      className="w-40 max-w-[60%] text-center border border-chrome/70 bg-black/40 text-chrome text-[13px] tracking-widest2 uppercase py-2.5 hover:bg-chrome hover:text-black transition"
                    >
                      Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
