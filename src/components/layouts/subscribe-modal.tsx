"use client";

import { useEffect, useState } from "react";
import { useScrollDepth } from "@/hooks/use-scroll-depth";
import { useSubscribeEmail } from "@/hooks/use-storefront-mutations";

const DISMISS_KEY = "hvvn-subscribe-dismissed";

/**
 * Email-capture prompt shown after the visitor has scrolled ~60% of a page.
 * Centered modal on desktop, bottom-sheet on mobile. Dismissed/subscribed state
 * is remembered in localStorage so it never nags twice.
 */
export function SubscribeModal() {
  const reached = useScrollDepth(0.6);
  const [dismissed, setDismissed] = useState(true); // hidden until localStorage is read
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeEmail();

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (reached && !dismissed) setOpen(true);
  }, [reached, dismissed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function remember() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  function dismiss() {
    remember();
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    subscribe.mutate(
      { email, source: "modal" },
      {
        onSuccess: () => {
          remember();
          setTimeout(() => setOpen(false), 1800);
        },
      }
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      {/* Opaque backdrop */}
      <div onClick={dismiss} className="absolute inset-0 bg-black/85" />

      {/* Bottom sheet — solid opaque background, full width */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="이메일 구독"
        className="relative w-full bg-black border-t border-line rounded-t-2xl px-6 pt-7 pb-9"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="absolute top-5 right-5 text-chrome/60 hover:text-chrome transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mx-auto max-w-xl">
          {subscribe.isSuccess ? (
            <div className="py-6 text-center">
              <div className="chrome-text text-2xl mb-2">감사합니다.</div>
              <p className="text-sm text-muted">새 소식과 재입고 정보를 이메일로 보내드릴게요.</p>
            </div>
          ) : (
            <>
              <div className="eyebrow mb-2">— Subscribe</div>
              <h2 className="chrome-text text-2xl sm:text-3xl">소식 받아보기</h2>
              <p className="text-sm text-muted mt-2 mb-5">
                새 드롭과 재입고 알림을 가장 먼저 받아보세요. 언제든 수신을 해지할 수 있어요.
              </p>
              <form onSubmit={submit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  aria-label="이메일 주소"
                  className="input flex-1"
                />
                <button disabled={subscribe.isPending} className="btn shrink-0">
                  {subscribe.isPending ? "..." : "Subscribe"}
                </button>
              </form>
              {subscribe.isError && (
                <div className="text-xs text-accent mt-2">{(subscribe.error as Error).message}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
