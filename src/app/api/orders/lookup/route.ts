import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { OrderItem } from "@/types";

// 입력 전화번호를 저장 형식(숫자만)으로 정규화해 조회 일관성 확보.
const Schema = z.object({
  name: z.string().trim().min(1),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().min(4)),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  const { name, phone } = parsed.data;

  const sb = createSupabaseServiceClient();
  const { data: orders, error } = await sb
    .from("orders")
    .select("*")
    .eq("customer_name", name)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!orders || orders.length === 0) return NextResponse.json({ orders: [] });

  const ids = orders.map((o: { id: string }) => o.id);
  const { data: items } = await sb.from("order_items").select("*").in("order_id", ids);
  const byOrder = new Map<string, OrderItem[]>();
  for (const it of (items ?? []) as OrderItem[]) {
    const list = byOrder.get(it.order_id) ?? [];
    list.push(it);
    byOrder.set(it.order_id, list);
  }
  const enriched = orders.map((o: { id: string }) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
  return NextResponse.json({ orders: enriched });
}
