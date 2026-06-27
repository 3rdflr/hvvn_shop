"use client";

import { useEffect, useState } from "react";
import { useScrollDepth } from "@/hooks/use-scroll-depth";
import { useSubscribeEmail } from "@/hooks/use-storefront-mutations";
import { useUi } from "@/store/ui";

const DISMISS_KEY = "hvvn-subscribe-dismissed";

/**
 * Email-capture bottom sheet (YZY-style layout, site palette) shown after ~60%
 * scroll. Dismissed/subscribed state is remembered in localStorage.
 */
export function SubscribeModal() {
  const reached = useScrollDepth(0.6);
  const openInfo = useUi((s) => s.openInfo);
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
      <div onClick={dismiss} className="absolute inset-0 bg-black/85" />

      {/* Bottom sheet — YZY framed card layout in the site palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="이메일 구독"
        className="relative flex w-full flex-col items-center border-t-2 border-chrome bg-black/80 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-4 z-10 p-1 text-chrome transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 14L34 34" />
            <path d="M14 34L34 14" />
          </svg>
        </button>

        <div className="flex w-[min(520px,100%)] flex-col gap-3 p-5 sm:p-6">
          {subscribe.isSuccess ? (
            <div className="py-4 text-center">
              <h2 className="chrome-text text-xl uppercase mb-2">Thank you</h2>
              <p className="text-sm text-muted">새 소식과 재입고 정보를 이메일로 보내드릴게요.</p>
            </div>
          ) : (
            <>
              <h2 className="uppercase chrome-text text-base tracking-wide">
                Receive website updates
              </h2>
              <form onSubmit={submit} className="flex w-full flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  aria-label="Email Address"
                  autoComplete="email"
                  className="box-border w-full border border-line bg-transparent p-3 text-sm uppercase text-ink placeholder:text-muted focus:outline-none focus:border-chrome"
                />
                <p className="text-[10px] leading-snug uppercase text-muted">
                  HVVN 이메일 마케팅 수신에 동의합니다. 구매를 위해 필수는 아닙니다.{" "}
                  <button
                    type="button"
                    onClick={openInfo}
                    className="underline hover:opacity-70"
                  >
                    개인정보처리방침
                  </button>
                  에서 권리와 정보 이용을 확인하세요.
                </p>
                {subscribe.isError && (
                  <p className="text-[11px] text-accent uppercase">
                    {(subscribe.error as Error).message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="box-border w-full border border-chrome bg-chrome p-3 text-sm uppercase text-black transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {subscribe.isPending ? "..." : "Subscribe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
