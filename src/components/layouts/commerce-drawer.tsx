"use client";

import { useEffect, useRef, useState } from "react";
import { useUi } from "@/store/ui";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { BagSection } from "@/components/features/bag-section";
import { OrderLookupSection } from "@/components/features/order-lookup-section";

/**
 * YZY-style commerce drawer. Slides in from the RIGHT and covers the FULL page
 * on both mobile and desktop. Holds the entire purchase flow (bag + orderer info
 * + completion) and order lookup — so the store needs no separate /cart,
 * /checkout, /orders routes.
 *
 * Rendered only after mount so the persisted cart count never causes a
 * server/client hydration mismatch.
 */
export function CommerceDrawer() {
  const [mounted, setMounted] = useState(false);
  const open = useUi((s) => s.drawerOpen);
  const tab = useUi((s) => s.drawerTab);
  const setTab = useUi((s) => s.setDrawerTab);
  const close = useUi((s) => s.closeDrawer);
  const count = useCart((s) => s.count());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[80]", open ? "pointer-events-auto" : "pointer-events-none")}
    >
      {/* Full-screen panel sliding in from the right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="장바구니 및 주문"
        tabIndex={-1}
        className={cn(
          "absolute inset-0 w-full bg-black flex flex-col outline-none",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header: tabs + close */}
        <div className="flex items-center justify-between border-b border-line container-page h-14 shrink-0">
          <div className="flex items-center gap-5">
            <TabButton active={tab === "bag"} onClick={() => setTab("bag")}>
              Bag{count > 0 ? ` (${count})` : ""}
            </TabButton>
            <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
              Orders
            </TabButton>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="text-chrome/70 hover:text-chrome transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="container-page py-8 md:py-12">
            {tab === "bag" ? <BagSection onShopMore={close} /> : <OrderLookupSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-[13px] tracking-widest2 uppercase transition pb-0.5 border-b",
        active ? "text-chrome border-chrome" : "text-muted border-transparent hover:text-chrome"
      )}
    >
      {children}
    </button>
  );
}
