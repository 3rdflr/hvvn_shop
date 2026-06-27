"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/store/ui";
import { useCart } from "@/store/cart";

/** Cart trigger — opens the commerce drawer (Bag tab). */
export function HeaderMenu() {
  const openDrawer = useUi((s) => s.openDrawer);
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const badge = mounted && count > 0;

  return (
    <button
      type="button"
      aria-label="장바구니 열기"
      onClick={() => openDrawer("bag")}
      className="relative flex items-center text-chrome hover:opacity-80 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome rounded-sm"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2 3h3l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h7.8a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
      </svg>
      {badge && (
        <span className="absolute -top-1.5 -right-2 bg-chrome text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </button>
  );
}
