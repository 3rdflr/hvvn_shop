import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { generateOrderNumber, isRemoteArea } from "@/lib/format";
import { checkoutSchema } from "@/lib/validation/order";
import { sendEmail } from "@/lib/integrations/resend";
import { orderConfirmationEmail } from "@/lib/emails/templates";
import type { Order } from "@/types";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "잘못된 입력입니다.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const input = parsed.data; // phone/postcode already normalized + validated
  const sb = createSupabaseServiceClient();

  // Re-fetch product prices & stock to prevent client tampering.
  const ids = input.items.map((i) => i.product_id);
  const { data: products, error: pErr } = await sb
    .from("products")
    .select("id, name, price_krw, stock, is_published")
    .in("id", ids);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  type ProductRow = {
    id: string;
    name: string;
    price_krw: number;
    stock: number;
    is_published: boolean;
  };
  const productMap = new Map<string, ProductRow>(
    ((products ?? []) as ProductRow[]).map((p) => [p.id, p])
  );
  let subtotal = 0;
  for (const item of input.items) {
    const p = productMap.get(item.product_id);
    if (!p || !p.is_published)
      return NextResponse.json(
        { error: "판매되지 않는 상품이 포함되어 있습니다." },
        { status: 400 }
      );
    if (p.stock < item.quantity)
      return NextResponse.json({ error: `${p.name} 재고가 부족합니다.` }, { status: 400 });
    subtotal += p.price_krw * item.quantity;
  }

  const { data: settings } = await sb
    .from("settings")
    .select(
      "shipping_fee_default, shipping_fee_remote, bank_name, bank_account_number, bank_account_holder"
    )
    .eq("id", 1)
    .maybeSingle();
  const remote = isRemoteArea(input.shipping_postcode);
  const shipping = remote
    ? settings?.shipping_fee_remote ?? 7000
    : settings?.shipping_fee_default ?? 4000;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const { data: order, error: oErr } = await sb
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email,
      shipping_postcode: input.shipping_postcode,
      shipping_address1: input.shipping_address1,
      shipping_address2: input.shipping_address2 || null,
      shipping_memo: input.shipping_memo || null,
      subtotal_krw: subtotal,
      shipping_fee_krw: shipping,
      total_krw: total,
      is_remote_area: remote,
      depositor_name: input.depositor_name,
      status: "pending_payment",
      payment_method: "bank_transfer",
    })
    .select()
    .single();
  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  const rows = input.items.map((i) => {
    const p = productMap.get(i.product_id)!;
    return {
      order_id: order.id,
      product_id: i.product_id,
      product_name_snapshot: p.name,
      unit_price_krw: p.price_krw,
      quantity: i.quantity,
    };
  });
  const { error: iErr } = await sb.from("order_items").insert(rows);
  if (iErr) {
    await sb.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: iErr.message }, { status: 500 });
  }

  // Decrement stock.
  for (const item of input.items) {
    const p = productMap.get(item.product_id)!;
    await sb.from("products").update({ stock: p.stock - item.quantity }).eq("id", item.product_id);
  }

  // Order confirmation email (non-blocking — a failed email never fails the order).
  const { subject, html } = orderConfirmationEmail({
    order: order as Order,
    items: rows,
    settings: settings
      ? {
          bank_name: settings.bank_name ?? null,
          bank_account_number: settings.bank_account_number ?? null,
          bank_account_holder: settings.bank_account_holder ?? null,
        }
      : null,
  });
  await sendEmail({
    to: input.customer_email,
    subject,
    html,
    template: "order_confirmation",
    refId: orderNumber,
  });

  return NextResponse.json({ order_number: orderNumber, id: order.id });
}
