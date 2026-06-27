"use client";

import { useState } from "react";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/types";
import {
  useLookupOrders,
  useCancelOrder,
  useUpdateOrderItems,
} from "@/hooks/use-storefront-mutations";
import { InquiryForm } from "@/components/features/inquiry-form";
import type { OrderLookupResult } from "@/lib/api/storefront";

/** Drawer "Orders" tab: look up orders, then confirm / edit quantities / cancel. */
export function OrderLookupSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const lookup = useLookupOrders();
  const results = lookup.data?.orders ?? null;

  const refresh = () => lookup.mutate({ name, phone });

  return (
    <div>
      <div className="eyebrow mb-3">— Orders</div>
      <p className="text-sm text-muted mb-5">
        주문 시 입력한 이름과 전화번호로 주문 확인·수정·취소를 할 수 있어요.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          refresh();
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
            <OrderCard key={o.id} order={o} name={name} phone={phone} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
  name,
  phone,
  onChanged,
}: {
  order: OrderLookupResult;
  name: string;
  phone: string;
  onChanged: () => void;
}) {
  const editable = order.status === "pending_payment";
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map((it) => [it.id, it.quantity]))
  );
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const cancel = useCancelOrder();
  const update = useUpdateOrderItems();

  const dirty = order.items.some((it) => (qty[it.id] ?? it.quantity) !== it.quantity);
  const newTotal = order.items.reduce(
    (s, it) => s + it.unit_price_krw * (qty[it.id] ?? it.quantity),
    0
  );

  function setItemQty(id: string, value: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(99, value)) }));
  }

  function save() {
    update.mutate(
      {
        order_id: order.id,
        name,
        phone,
        items: order.items.map((it) => ({ id: it.id, quantity: qty[it.id] ?? it.quantity })),
      },
      { onSuccess: onChanged }
    );
  }

  function doCancel() {
    if (!confirm("이 주문을 취소할까요? 되돌릴 수 없습니다.")) return;
    cancel.mutate({ order_id: order.id, name, phone }, { onSuccess: onChanged });
  }

  return (
    <li className="border border-line p-4">
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <div className="font-mono text-sm text-chrome">{order.order_number}</div>
          <div className="text-xs text-muted">{formatDate(order.created_at)}</div>
        </div>
        <div className="text-[10px] tracking-widest2 uppercase border border-chrome/60 text-chrome px-2 py-1 whitespace-nowrap">
          {ORDER_STATUS_LABEL[order.status]}
        </div>
      </div>

      <ul className="text-sm divide-y divide-line">
        {order.items.map((it) => {
          const q = qty[it.id] ?? it.quantity;
          return (
            <li key={it.id} className="py-2 flex items-center justify-between gap-2">
              <span className="truncate flex-1 min-w-0">{it.product_name_snapshot}</span>
              {editable ? (
                <div className="flex items-center border border-line shrink-0">
                  <button
                    type="button"
                    aria-label="수량 감소"
                    onClick={() => setItemQty(it.id, q - 1)}
                    className="w-7 h-7 text-chrome hover:bg-velvetGlow/40"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{q}</span>
                  <button
                    type="button"
                    aria-label="수량 증가"
                    onClick={() => setItemQty(it.id, q + 1)}
                    className="w-7 h-7 text-chrome hover:bg-velvetGlow/40"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-muted shrink-0">× {it.quantity}</span>
              )}
              <span className="whitespace-nowrap w-20 text-right">
                {formatKRW(it.unit_price_krw * q)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-between items-baseline mt-3">
        <span className="text-sm text-muted">{dirty ? "변경 후 상품합계" : "합계"}</span>
        <span className="chrome-text text-lg">
          {formatKRW(dirty ? newTotal : order.total_krw)}
        </span>
      </div>
      {dirty && (
        <p className="text-[11px] text-muted mt-1">배송비 포함 최종 금액은 저장 후 갱신됩니다.</p>
      )}

      {(update.isError || cancel.isError) && (
        <div className="text-xs text-accent mt-2">
          {((update.error || cancel.error) as Error)?.message}
        </div>
      )}

      {editable && (
        <div className="flex flex-wrap gap-2 mt-3">
          {dirty && (
            <button onClick={save} disabled={update.isPending} className="btn-outline">
              {update.isPending ? "저장 중..." : "수량 변경 저장"}
            </button>
          )}
          <button onClick={doCancel} disabled={cancel.isPending} className="btn-ghost text-accent px-0">
            {cancel.isPending ? "취소 중..." : "주문 취소"}
          </button>
        </div>
      )}

      {inquirySent ? (
        <div className="mt-3 text-sm text-muted">
          문의가 접수되었습니다. 관리자가 이메일로 답변드릴게요.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setInquiryOpen((v) => !v)}
            className="btn-ghost px-0 underline mt-3"
          >
            {inquiryOpen ? "문의 닫기" : "관리자에게 문의"}
          </button>
          {inquiryOpen && (
            <InquiryForm
              orderId={order.id}
              customerName={order.customer_name}
              customerPhone={order.customer_phone}
              email={order.customer_email}
              onSubmitted={() => setInquirySent(true)}
            />
          )}
        </>
      )}
    </li>
  );
}
