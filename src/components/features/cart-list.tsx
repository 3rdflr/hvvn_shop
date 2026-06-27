"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatKRW } from "@/lib/format";
import type { CartLine } from "@/types";

export function CartList() {
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);

  return (
    <ul className="border-t border-line">
      {lines.map((l) => (
        <CartRow key={l.product_id} line={l} onRemove={remove} onSetQty={setQuantity} />
      ))}
    </ul>
  );
}

function CartRow({
  line: l,
  onRemove,
  onSetQty,
}: {
  line: CartLine;
  onRemove: (id: string) => void;
  onSetQty: (id: string, qty: number) => void;
}) {
  return (
    <li className="py-5 border-b border-line flex gap-4 sm:gap-6">
      <Link
        href={`/products/${l.product_id}`}
        className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 overflow-hidden"
      >
        {l.thumbnail_url && (
          <Image src={l.thumbnail_url} alt={l.name} fill className="object-contain" sizes="112px" />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between gap-3">
          <Link
            href={`/products/${l.product_id}`}
            className="chrome-text text-2xl sm:text-3xl leading-tight hover:opacity-80 transition truncate"
          >
            {l.name}
          </Link>
          <div className="text-sm chrome-text-soft whitespace-nowrap">
            {formatKRW(l.price_krw * l.quantity)}
          </div>
        </div>
        <div className="text-xs text-muted mt-1">{formatKRW(l.price_krw)} / 개</div>

        {/* Bottom row: quantity stepper (left) · remove (bottom-right, now clearly visible) */}
        <div className="flex items-end justify-between gap-4 mt-auto pt-3">
          <div className="flex items-center border border-line">
            <button
              type="button"
              aria-label="수량 감소"
              onClick={() => onSetQty(l.product_id, l.quantity - 1)}
              className="w-8 h-8 text-chrome hover:bg-velvetGlow/40 transition"
            >
              −
            </button>
            <span className="w-9 text-center text-sm text-chrome">{l.quantity}</span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={() => onSetQty(l.product_id, l.quantity + 1)}
              className="w-8 h-8 text-chrome hover:bg-velvetGlow/40 transition"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(l.product_id)}
            aria-label={`${l.name} 삭제`}
            className="inline-flex items-center gap-1.5 border border-line text-chrome/80 hover:text-black hover:bg-chrome hover:border-chrome transition px-3 h-8 text-[11px] tracking-widest2 uppercase focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
