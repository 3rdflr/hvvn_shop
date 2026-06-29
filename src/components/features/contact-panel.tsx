"use client";

import { useEffect, useState } from "react";
import { useCreateInquiry } from "@/hooks/use-storefront-mutations";
import { useUi } from "@/store/ui";

/**
 * Contact modal launched from the business card. Reuses the inquiries system
 * (no order_id) so messages land in the admin Inquiries tab + rate-limiting.
 */
export function ContactPanel() {
  const open = useUi((s) => s.contactOpen);
  const close = useUi((s) => s.closeContact);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const inquiry = useCreateInquiry();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  function send(e: React.FormEvent) {
    e.preventDefault();
    inquiry.mutate({ customer_name: name, customer_email: email, message });
  }

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-5">
      <div onClick={close} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div className="relative w-[min(480px,100%)] p-[1.5px] rounded-2xl bg-gradient-to-br from-chrome/80 via-chrome/20 to-chrome/70">
        <div className="rounded-2xl bg-black/95 p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="absolute top-4 right-4 text-chrome/70 hover:text-chrome transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="eyebrow mb-2">— Contact</div>
          <h2 className="chrome-text text-2xl mb-5">문의하기</h2>

          {inquiry.isSuccess ? (
            <p className="text-sm text-ink/90 py-4">
              메시지가 접수되었습니다. 이메일로 답변드릴게요.
            </p>
          ) : (
            <form onSubmit={send} className="space-y-4">
              <label className="block">
                <span className="label">이름</span>
                <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="label">이메일 (답변 받을 주소)</span>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">내용</span>
                <textarea
                  className="input-box"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="작업 의뢰, 협업, 스타일 풀 등 무엇이든"
                />
              </label>
              {inquiry.isError && (
                <p className="text-xs text-accent">{(inquiry.error as Error).message}</p>
              )}
              <button className="btn w-full" disabled={inquiry.isPending}>
                {inquiry.isPending ? "보내는 중..." : "보내기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
