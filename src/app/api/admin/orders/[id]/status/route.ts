import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { sendEmail } from "@/lib/integrations/resend";
import { shippingEmail } from "@/lib/emails/templates";
import type { Order } from "@/types";

const Schema = z.object({
  status: z.enum(["pending_payment", "paid", "shipping", "delivered", "cancelled"]),
});

const TIMESTAMP_FIELD: Record<string, string | undefined> = {
  paid: "paid_at",
  shipping: "shipped_at",
  delivered: "delivered_at",
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 상태" }, { status: 400 });

  const patch: Record<string, unknown> = { status: parsed.data.status };
  const tsField = TIMESTAMP_FIELD[parsed.data.status];
  if (tsField) patch[tsField] = new Date().toISOString();

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("orders").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the customer when the order ships.
  if (parsed.data.status === "shipping") {
    const { data: order } = await svc.from("orders").select("*").eq("id", id).maybeSingle<Order>();
    if (order?.customer_email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const { subject, html } = shippingEmail({ order, siteUrl });
      await sendEmail({
        to: order.customer_email,
        subject,
        html,
        template: "shipping",
        refId: order.order_number,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
