import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { sendEmail } from "@/lib/integrations/resend";
import { restockEmail } from "@/lib/emails/templates";
import type { Product, WaitlistEntry } from "@/types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const svc = createSupabaseServiceClient();

  const { data: product } = await svc
    .from("products")
    .select("id, name")
    .eq("id", id)
    .maybeSingle<Pick<Product, "id" | "name">>();
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });

  const { data: pending } = await svc
    .from("waitlist")
    .select("*")
    .eq("product_id", id)
    .is("notified_at", null);
  const entries = (pending ?? []) as WaitlistEntry[];

  if (entries.length === 0) {
    return NextResponse.json({ sent: 0, message: "대기 중인 알림이 없습니다." });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/products/${product.id}`;
  const { subject, html } = restockEmail({ productName: product.name, productUrl });

  let sent = 0;
  const now = new Date().toISOString();
  for (const entry of entries) {
    const res = await sendEmail({
      to: entry.email,
      subject,
      html,
      template: "restock",
      refId: product.id,
    });
    if (res.ok) {
      sent += 1;
      await svc.from("waitlist").update({ notified_at: now }).eq("id", entry.id);
    }
  }

  return NextResponse.json({ sent, total: entries.length });
}
