import { createSupabaseServiceClient } from "@/lib/supabase/server";

type Svc = ReturnType<typeof createSupabaseServiceClient>;

/** Add an order's item quantities back into product stock (idempotent caller's job). */
export async function restoreStockForOrder(svc: Svc, orderId: string) {
  const { data: items } = await svc
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);
  for (const it of (items ?? []) as { product_id: string | null; quantity: number }[]) {
    if (!it.product_id) continue;
    const { data: p } = await svc
      .from("products")
      .select("stock")
      .eq("id", it.product_id)
      .maybeSingle<{ stock: number }>();
    if (p) {
      await svc.from("products").update({ stock: p.stock + it.quantity }).eq("id", it.product_id);
    }
  }
}

/** Recompute subtotal / shipping / total from the order's current items. */
export async function recomputeOrderTotals(svc: Svc, orderId: string) {
  const { data: order } = await svc
    .from("orders")
    .select("is_remote_area")
    .eq("id", orderId)
    .maybeSingle<{ is_remote_area: boolean }>();
  const { data: items } = await svc
    .from("order_items")
    .select("unit_price_krw, quantity")
    .eq("order_id", orderId);
  const subtotal = ((items ?? []) as { unit_price_krw: number; quantity: number }[]).reduce(
    (s, i) => s + i.unit_price_krw * i.quantity,
    0
  );
  const { data: settings } = await svc
    .from("settings")
    .select("shipping_fee_default, shipping_fee_remote")
    .eq("id", 1)
    .maybeSingle<{ shipping_fee_default: number; shipping_fee_remote: number }>();
  const shipping = order?.is_remote_area
    ? settings?.shipping_fee_remote ?? 7000
    : settings?.shipping_fee_default ?? 4000;
  await svc
    .from("orders")
    .update({ subtotal_krw: subtotal, shipping_fee_krw: shipping, total_krw: subtotal + shipping })
    .eq("id", orderId);
}

/** Cancel an order + restore stock (no-op if already cancelled). */
export async function cancelOrderWithRestock(svc: Svc, orderId: string) {
  const { data: order } = await svc
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle<{ status: string }>();
  if (!order || order.status === "cancelled") return;
  await restoreStockForOrder(svc, orderId);
  await svc.from("orders").update({ status: "cancelled" }).eq("id", orderId);
}

/** Normalize a phone the way orders are stored (digits only). */
export function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}
