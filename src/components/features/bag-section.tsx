"use client";

import { useCart } from "@/store/cart";
import { useCheckout } from "@/hooks/use-checkout";
import { TextField } from "@/components/ui/text-field";
import { CartList } from "@/components/features/cart-list";
import { OrderCompletion } from "@/components/features/order-completion";
import { formatKRW } from "@/lib/format";

/**
 * Drawer "Bag" tab.
 *  - Desktop: two columns — orderer info (left) · cart (right).
 *  - Mobile: single column — cart first, then orderer info.
 * The cart lives OUTSIDE the <form> so its qty/remove buttons can never submit
 * the order form (which previously fired validation on every cart change).
 */
export function BagSection({ onShopMore }: { onShopMore: () => void }) {
  const lineCount = useCart((s) => s.lines.length);
  const c = useCheckout();

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
    <div className="flex flex-col md:flex-row md:gap-10 lg:gap-16 md:items-start">
      {/* Cart — right on desktop, first on mobile */}
      <section className="order-1 md:order-2 md:flex-1 md:max-w-md w-full">
        <div className="eyebrow mb-3">— Bag · {lineCount}</div>
        <CartList />
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted">상품 합계</span>
          <span className="chrome-text text-xl">{formatKRW(c.subtotal)}</span>
        </div>
        <p className="text-xs text-muted mt-1">배송비는 우편번호 입력 시 계산됩니다.</p>
      </section>

      {/* Orderer info — left on desktop, second on mobile */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          c.submit();
        }}
        noValidate
        className="order-2 md:order-1 md:flex-1 w-full space-y-10 mt-12 md:mt-0"
      >
        <section className="space-y-5">
          <div className="eyebrow">— 주문자 정보</div>
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
        </section>

        <section className="space-y-5">
          <div className="eyebrow">— 배송지</div>
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
          <div className="eyebrow">— 결제 (무통장입금)</div>
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

        <div className="space-y-2 border-t border-line pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted">상품 합계</span>
            <span>{formatKRW(c.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">배송비</span>
            <span>{formatKRW(c.shippingFee)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted">합계</span>
            <span className="chrome-text text-2xl">{formatKRW(c.total)}</span>
          </div>
        </div>

        {c.errors._form && <div className="text-sm text-red-400">{c.errors._form}</div>}

        <button disabled={c.submitting} className="btn w-full">
          {c.submitting ? "Processing..." : `${formatKRW(c.total)} 주문하기`}
        </button>
      </form>
    </div>
  );
}
