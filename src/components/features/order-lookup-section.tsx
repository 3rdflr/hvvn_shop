"use client";

import { useState } from "react";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/types";
import { useLookupOrders } from "@/hooks/use-storefront-mutations";
import { InquiryForm } from "@/components/features/inquiry-form";

/** Drawer "Orders" tab: look up past orders by name + phone, then inquire. */
export function OrderLookupSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryFor, setInquiryFor] = useState<string | null>(null);
  const [submittedOrders, setSubmittedOrders] = useState<Set<string>>(new Set());
  const lookup = useLookupOrders();
  const results = lookup.data?.orders ?? null;

  function markSubmitted(orderId: string) {
    setSubmittedOrders((prev) => new Set(prev).add(orderId));
  }

  return (
    <div>
      <div className="eyebrow mb-3">— Orders</div>
      <p className="text-sm text-muted mb-5">
        주문 시 입력한 이름과 전화번호로 모든 주문을 확인할 수 있어요.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup.mutate({ name, phone });
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="label">이름</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="label">전화번호</span>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="01012345678"
            inputMode="numeric"
          />
        </label>
        <button className="btn w-full" disabled={lookup.isPending}>
          {lookup.isPending ? "조회 중…" : "조회"}
        </button>
      </form>

      {lookup.isError && (
        <div className="mt-4 text-sm text-accent">{(lookup.error as Error).message}</div>
      )}

      {results && results.length === 0 && (
        <div className="mt-10 text-center text-muted text-sm">주문 내역이 없습니다.</div>
      )}

      {results && results.length > 0 && (
        <ul className="mt-8 space-y-5">
          {results.map((o) => (
            <li key={o.id} className="border border-line p-4">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <div className="font-mono text-sm text-chrome">{o.order_number}</div>
                  <div className="text-xs text-muted">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-[10px] tracking-widest2 uppercase border border-chrome/60 text-chrome px-2 py-1 whitespace-nowrap">
                  {ORDER_STATUS_LABEL[o.status]}
                </div>
              </div>
              <ul className="text-sm divide-y divide-line">
                {o.items.map((it) => (
                  <li key={it.id} className="py-2 flex justify-between gap-2">
                    <span className="truncate">
                      {it.product_name_snapshot} × {it.quantity}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatKRW(it.unit_price_krw * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-baseline mt-3">
                <span className="text-sm text-muted">합계</span>
                <span className="chrome-text text-lg">{formatKRW(o.total_krw)}</span>
              </div>

              {submittedOrders.has(o.id) ? (
                <div className="mt-3 text-sm text-muted">
                  문의가 접수되었습니다. 관리자가 이메일로 답변드릴게요.
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setInquiryFor(inquiryFor === o.id ? null : o.id)}
                    className="btn-ghost px-0 underline mt-3"
                  >
                    {inquiryFor === o.id ? "문의 닫기" : "관리자에게 문의"}
                  </button>
                  {inquiryFor === o.id && (
                    <InquiryForm
                      orderId={o.id}
                      customerName={o.customer_name}
                      customerPhone={o.customer_phone}
                      email={o.customer_email}
                      onSubmitted={() => markSubmitted(o.id)}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
