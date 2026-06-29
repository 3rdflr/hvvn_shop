import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/order";
import { checkInquiryRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/integrations/resend";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );
}

const Schema = z.object({
  order_id: z.string().uuid().optional(),
  customer_name: z.string().trim().min(1),
  customer_phone: z.string().trim().optional(),
  customer_email: emailSchema,
  message: z.string().trim().min(1, "문의 내용을 입력해주세요").max(2000),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "잘못된 입력", issues: parsed.error.issues },
      { status: 400 }
    );

  const input = parsed.data;

  // Block the "무한 문의 전송" issue: cooldown + daily cap + duplicate suppression.
  const limit = await checkInquiryRateLimit({
    orderId: input.order_id ?? null,
    email: input.customer_email,
    message: input.message,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: limit.error }, { status: limit.status });
  }

  const sb = createSupabaseServiceClient();
  const { error } = await sb.from("inquiries").insert({
    order_id: input.order_id ?? null,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone ?? null,
    customer_email: input.customer_email,
    message: input.message,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the admin's configured contact email (best-effort; never blocks the
  // submission). Reply-to is set to the customer so admin can answer directly.
  const { data: settings } = await sb
    .from("settings")
    .select("contact_email")
    .eq("id", 1)
    .maybeSingle<{ contact_email: string | null }>();
  if (settings?.contact_email) {
    const html = `
      <h2>새 문의가 접수되었습니다</h2>
      <p><b>이름</b>: ${escapeHtml(input.customer_name)}</p>
      <p><b>이메일</b>: ${escapeHtml(input.customer_email)}</p>
      ${input.customer_phone ? `<p><b>전화</b>: ${escapeHtml(input.customer_phone)}</p>` : ""}
      ${input.order_id ? `<p><b>주문 연결</b>: ${escapeHtml(input.order_id)}</p>` : ""}
      <p><b>내용</b>:</p>
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    `;
    await sendEmail({
      to: settings.contact_email,
      subject: `[HVVN 문의] ${input.customer_name}`,
      html,
      template: "inquiry",
      refId: input.order_id ?? input.customer_email,
      replyTo: input.customer_email,
    });
  }

  return NextResponse.json({ ok: true });
}
