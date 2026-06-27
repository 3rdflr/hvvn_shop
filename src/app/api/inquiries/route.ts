import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/order";
import { checkInquiryRateLimit } from "@/lib/rate-limit";

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
  return NextResponse.json({ ok: true });
}
