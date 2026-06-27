"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const idx = state.lines.findIndex((l) => l.product_id === line.product_id);
          if (idx === -1) return { lines: [...state.lines, line] };
          const next = [...state.lines];
          const current = next[idx]!;
          const merged = Math.min(line.stock, current.quantity + line.quantity);
          next[idx] = { ...current, quantity: merged };
          return { lines: next };
        }),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.product_id !== productId) })),
      setQuantity: (productId, qty) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.product_id === productId
              ? { ...l, quantity: Math.max(1, Math.min(l.stock, qty)) }
              : l
          ),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price_krw * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "hvvn-cart" }
  )
);
