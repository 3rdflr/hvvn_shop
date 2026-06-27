import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { cancelOrderWithRestock, normalizePhone } from "@/lib/order-mutations";
import type { Order } from "@/types";

const Schema = z.object({
  order_id: z.string().uuid(),
  name: z.string().trim().min(1),
  phone: z.string().trim().min(4),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("*")
    .eq("id", parsed.data.order_id)
    .maybeSingle<Order>();

  // Ownership check: only the customer who placed it (name + phone) may cancel.
  if (
    !order ||
    order.customer_name !== parsed.data.name.trim() ||
    order.customer_phone !== normalizePhone(parsed.data.phone)
  ) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (order.status === "cancelled") return NextResponse.json({ ok: true });
  if (order.status !== "pending_payment") {
    return NextResponse.json(
      { error: "이미 처리 중인 주문은 직접 취소할 수 없습니다. 관리자에게 문의해주세요." },
      { status: 400 }
    );
  }

  await cancelOrderWithRestock(svc, order.id);
  return NextResponse.json({ ok: true });
}
