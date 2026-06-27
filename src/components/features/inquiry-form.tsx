"use client";

import { useState } from "react";
import { useCreateInquiry } from "@/hooks/use-storefront-mutations";

/**
 * M2: validated inquiry submit (button locks while pending, hides after success).
 * M3 layers server-side rate-limiting + duplicate suppression to fully fix the
 * "무한 문의 전송" issue.
 */
export function InquiryForm({
  orderId,
  customerName,
  customerPhone,
  email,
  onSubmitted,
}: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  email: string | null;
  onSubmitted?: () => void;
}) {
  const [msg, setMsg] = useState("");
  const [emailVal, setEmailVal] = useState(email ?? "");
  const inquiry = useCreateInquiry();

  function send(e: React.FormEvent) {
    e.preventDefault();
    inquiry.mutate(
      {
        order_id: orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: emailVal,
        message: msg,
      },
      { onSuccess: () => onSubmitted?.() }
    );
  }

  if (inquiry.isSuccess) {
    return <div className="mt-4 text-sm">문의가 접수되었습니다. 관리자가 이메일로 답변드릴게요.</div>;
  }

  return (
    <form onSubmit={send} className="mt-4 space-y-3 border border-line p-4">
      <label className="block">
        <span className="label">이메일 (답변 받을 주소)</span>
        <input
          className="input"
          type="email"
          required
          value={emailVal}
          onChange={(e) => setEmailVal(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="label">문의 내용</span>
        <textarea
          className="input-box"
          rows={4}
          required
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
      </label>
      {inquiry.isError && (
        <div className="text-xs text-accent">{(inquiry.error as Error).message}</div>
      )}
      <button className="btn-outline w-full sm:w-auto" disabled={inquiry.isPending}>
        {inquiry.isPending ? "..." : "문의 보내기"}
      </button>
    </form>
  );
}
