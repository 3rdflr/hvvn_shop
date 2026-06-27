import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { recomputeOrderTotals, normalizePhone } from "@/lib/order-mutations";
import type { Order } from "@/types";

const Schema = z.object({
  order_id: z.string().uuid(),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(4),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(0).max(99) })).min(1),
});

export async function PATCH(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("*")
    .eq("id", parsed.data.order_id)
    .maybeSingle<Order>();

  if (
    !order ||
    order.customer_name !== parsed.data.name.trim() ||
    order.customer_phone !== normalizePhone(parsed.data.phone)
  ) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.status !== "pending_payment") {
    return NextResponse.json(
      { error: "이미 처리 중인 주문은 수정할 수 없습니다." },
      { status: 400 }
    );
  }

  type Row = { id: string; product_id: string | null; quantity: number };
  const { data: existingData } = await svc
    .from("order_items")
    .select("id, product_id, quantity")
    .eq("order_id", order.id);
  const existing = new Map<string, Row>(((existingData ?? []) as Row[]).map((r) => [r.id, r]));

  // Compute deltas and validate stock for increases up-front.
  const changes: { row: Row; newQty: number; delta: number }[] = [];
  for (const upd of parsed.data.items) {
    const row = existing.get(upd.id);
    if (!row) continue;
    changes.push({ row, newQty: upd.quantity, delta: upd.quantity - row.quantity });
  }

  for (const c of changes) {
    if (c.delta > 0 && c.row.product_id) {
      const { data: p } = await svc
        .from("products")
        .select("name, stock")
        .eq("id", c.row.product_id)
        .maybeSingle<{ name: string; stock: number }>();
      if (p && p.stock < c.delta) {
        return NextResponse.json({ error: `${p.name} 재고가 부족합니다.` }, { status: 400 });
      }
    }
  }

  // Apply: adjust stock + update/delete order_items.
  for (const c of changes) {
    if (c.delta !== 0 && c.row.product_id) {
      const { data: p } = await svc
        .from("products")
        .select("stock")
        .eq("id", c.row.product_id)
        .maybeSingle<{ stock: number }>();
      if (p) {
        await svc
          .from("products")
          .update({ stock: Math.max(0, p.stock - c.delta) })
          .eq("id", c.row.product_id);
      }
    }
    if (c.newQty === 0) {
      await svc.from("order_items").delete().eq("id", c.row.id);
    } else if (c.delta !== 0) {
      await svc.from("order_items").update({ quantity: c.newQty }).eq("id", c.row.id);
    }
  }

  // If everything was removed, cancel the order; otherwise recompute totals.
  const { count } = await svc
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);
  if ((count ?? 0) === 0) {
    await svc.from("orders").update({ status: "cancelled" }).eq("id", order.id);
  } else {
    await recomputeOrderTotals(svc, order.id);
  }

  return NextResponse.json({ ok: true });
}
