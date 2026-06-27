"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/store/cart";
import { useCheckout } from "@/hooks/use-checkout";
import { useSubscribeEmail } from "@/hooks/use-storefront-mutations";
import { TextField } from "@/components/ui/text-field";
import { OrderCompletion } from "@/components/features/order-completion";
import { formatKRW } from "@/lib/format";
import type { CartLine } from "@/types";

/**
 * Drawer "Bag" tab — YZY-style two-column checkout adapted to the black/chrome
 * palette.
 *  - Desktop: form (left) · sticky Order Summary (right), split ~50/50.
 *  - Mobile: Order Summary (top) → contact/subscribe → address → payment.
 * The summary lives OUTSIDE the <form> so its qty/remove controls never submit.
 */
export function BagSection({ onShopMore }: { onShopMore: () => void }) {
  const lineCount = useCart((s) => s.lines.length);
  const c = useCheckout();
  const [subscribe, setSubscribe] = useState(false);
  const subEmail = useSubscribeEmail();
  const subscribedRef = useRef(false);

  // Opt the customer into the mailing list once the order is placed.
  useEffect(() => {
    if (
      c.completedOrderNumber &&
      subscribe &&
      !subscribedRef.current &&
      c.form.customer_email
    ) {
      subscribedRef.current = true;
      subEmail.mutate({ email: c.form.customer_email, source: "checkout" });
    }
  }, [c.completedOrderNumber, subscribe, c.form.customer_email, subEmail]);

  if (c.completedOrderNumber) {
    return (
      <div className="max-w-xl mx-auto">
        <OrderCompletion orderNumber={c.completedOrderNumber} />
      </div>
    );
  }

  if (lineCount === 0) {
    return (
      <div className="py-16 text-center">
        <div className="eyebrow mb-3">— Bag</div>
        <p className="text-sm text-muted mb-6">장바구니가 비어 있습니다.</p>
        <button type="button" onClick={onShopMore} className="btn-outline">
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:flex-nowrap lg:items-start lg:justify-center gap-x-16 gap-y-10">
      {/* Order Summary — right on desktop (sticky), first on mobile. */}
      <aside className="order-1 lg:order-2 w-full lg:w-[min(34rem,50%)] lg:sticky lg:top-4">
        <OrderSummary
          subtotal={c.subtotal}
          shippingFee={c.shippingFee}
          total={c.total}
          remote={c.remote}
          remoteFee={c.fees.remote}
        />
      </aside>

      {/* Checkout form — left on desktop, second on mobile. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          c.submit();
        }}
        noValidate
        className="order-2 lg:order-1 w-full lg:w-[min(34rem,50%)] space-y-10"
      >
        <section className="space-y-5">
          <SectionHeader>주문자 정보</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <TextField
              name="customer_name"
              label="이름"
              required
              value={c.form.customer_name}
              error={c.errors.customer_name}
              onChange={(v) => c.setField("customer_name", v)}
            />
            <TextField
              name="customer_phone"
              label="전화번호"
              required
              inputMode="numeric"
              placeholder="01012345678"
              value={c.form.customer_phone}
              error={c.errors.customer_phone}
              onChange={(v) => c.setField("customer_phone", v)}
            />
            <TextField
              name="customer_email"
              label="이메일"
              type="email"
              required
              placeholder="주문 확인 메일 주소"
              className="sm:col-span-2"
              value={c.form.customer_email}
              error={c.errors.customer_email}
              onChange={(v) => c.setField("customer_email", v)}
            />
          </div>
          <label className="flex w-full cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-chrome"
            />
            <span className="text-[11px] tracking-widest2 uppercase text-muted">
              새 소식·재입고 알림 받기 (구독)
            </span>
          </label>
        </section>

        <section className="space-y-5">
          <SectionHeader>배송지</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <TextField
              name="shipping_postcode"
              label="우편번호"
              required
              inputMode="numeric"
              placeholder="5자리"
              value={c.form.shipping_postcode}
              error={c.errors.shipping_postcode}
              onChange={(v) => c.setField("shipping_postcode", v)}
            />
            <div className="hidden sm:block" />
            <TextField
              name="shipping_address1"
              label="주소"
              required
              className="sm:col-span-2"
              value={c.form.shipping_address1}
              error={c.errors.shipping_address1}
              onChange={(v) => c.setField("shipping_address1", v)}
            />
            <TextField
              name="shipping_address2"
              label="상세주소"
              className="sm:col-span-2"
              value={c.form.shipping_address2}
              error={c.errors.shipping_address2}
              onChange={(v) => c.setField("shipping_address2", v)}
            />
            <TextField
              name="shipping_memo"
              label="배송 메모"
              className="sm:col-span-2"
              value={c.form.shipping_memo}
              error={c.errors.shipping_memo}
              onChange={(v) => c.setField("shipping_memo", v)}
            />
          </div>
          {c.remote && (
            <div className="text-xs text-accent">
              제주/도서산간 지역으로 배송비가 {formatKRW(c.fees.remote)}으로 적용됩니다.
            </div>
          )}
        </section>

        <section className="space-y-5">
          <SectionHeader>결제 · 무통장입금</SectionHeader>
          <TextField
            name="depositor_name"
            label="입금자명"
            required
            value={c.form.depositor_name}
            error={c.errors.depositor_name}
            onChange={(v) => c.setField("depositor_name", v)}
          />
          <p className="text-xs text-muted">
            주문 완료 후 안내되는 계좌로 입금해주세요. 입금자명이 다른 경우 주문 확인이 늦어질 수
            있습니다.
          </p>
        </section>

        {c.errors._form && <div className="text-sm text-red-400">{c.errors._form}</div>}

        <button disabled={c.submitting} className="btn w-full">
          {c.submitting ? "Processing..." : `${formatKRW(c.total)} 주문하기`}
        </button>
      </form>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="w-full border-b border-line pb-2 text-[12px] tracking-widest2 uppercase text-chrome/90">
      {children}
    </h3>
  );
}

/** YZY-style compact order summary: item rows + qty steppers + totals. */
function OrderSummary({
  subtotal,
  shippingFee,
  total,
  remote,
  remoteFee,
}: {
  subtotal: number;
  shippingFee: number;
  total: number;
  remote: boolean;
  remoteFee: number;
}) {
  const lines = useCart((s) => s.lines);

  return (
    <div className="flex w-full flex-col">
      <SectionHeader>Order Summary</SectionHeader>

      <div className="no-scrollbar my-2 flex max-h-[46vh] w-full flex-col gap-5 overflow-y-auto py-4">
        {lines.map((l) => (
          <SummaryRow key={l.product_id} line={l} />
        ))}
      </div>

      <dl className="flex w-full flex-col gap-1 border-y border-line py-3 text-[13px] uppercase">
        <Row label="Subtotal" value={formatKRW(subtotal)} />
        <Row label="Shipping" value={formatKRW(shippingFee)} />
        {remote && (
          <p className="text-[11px] text-accent normal-case tracking-normal">
            제주/도서산간 +{formatKRW(remoteFee)}
          </p>
        )}
      </dl>

      <div className="flex w-full items-baseline justify-between py-3 uppercase">
        <span className="text-[13px] text-muted">Total</span>
        <span className="chrome-text text-2xl">{formatKRW(total)}</span>
      </div>
    </div>
  );
}

function SummaryRow({ line: l }: { line: CartLine }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex w-full items-start gap-4">
      <Link
        href={`/products/${l.product_id}`}
        className="relative w-24 aspect-square shrink-0 overflow-hidden"
      >
        {l.thumbnail_url && (
          <Image src={l.thumbnail_url} alt={l.name} fill className="object-contain" sizes="96px" />
        )}
      </Link>

      <div className="flex flex-1 min-w-0 flex-col gap-1 text-[13px] uppercase">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="chrome-text-soft truncate">{l.name}</span>
          <span className="whitespace-nowrap text-chrome/90">
            {formatKRW(l.price_krw * l.quantity)}
          </span>
        </div>
        <div className="text-[11px] normal-case tracking-normal text-muted">
          {formatKRW(l.price_krw)} / 개
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center border border-line">
            <button
              type="button"
              aria-label="수량 감소"
              onClick={() => setQuantity(l.product_id, l.quantity - 1)}
              className="w-7 h-7 text-chrome hover:bg-velvetGlow/40 transition"
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-chrome">{l.quantity}</span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={() => setQuantity(l.product_id, l.quantity + 1)}
              className="w-7 h-7 text-chrome hover:bg-velvetGlow/40 transition"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(l.product_id)}
            aria-label={`${l.name} 삭제`}
            className="text-[10px] tracking-widest2 uppercase text-chrome/60 hover:text-chrome transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="flex-1 text-muted">{label}</span>
      <span className="text-chrome/90">{value}</span>
    </div>
  );
}
