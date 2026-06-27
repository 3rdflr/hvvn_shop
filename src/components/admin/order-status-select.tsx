"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/api/admin";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "shipping",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [saving, setSaving] = useState(false);

  async function change(next: OrderStatus) {
    setValue(next);
    setSaving(true);
    try {
      await updateOrderStatus(orderId, next);
      router.refresh();
    } catch {
      setValue(status); // revert on failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value as OrderStatus)}
      className="bg-black border border-line text-chrome text-[12px] tracking-widest2 uppercase px-2 py-1 focus:outline-none focus:border-chrome"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
