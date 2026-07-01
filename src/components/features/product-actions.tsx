"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function toLine() {
    return {
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price_krw: product.price_krw,
      thumbnail_url: product.thumbnail_url,
      quantity: qty,
      stock: product.stock,
    };
  }

  function handleAdd() {
    add(toLine());
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    add(toLine());
    router.push("/checkout");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="eyebrow">Qty</span>
        <div className="flex items-center border border-line">
          <button
            aria-label="수량 감소"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-9 h-9 hover:bg-sand"
          >
            −
          </button>
          <span className="w-10 text-center">{qty}</span>
          <button
            aria-label="수량 증가"
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            className="w-9 h-9 hover:bg-sand"
          >
            +
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleAdd} className="btn-outline">
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button onClick={handleBuyNow} className="btn">
          Buy now
        </button>
      </div>
    </div>
  );
}
