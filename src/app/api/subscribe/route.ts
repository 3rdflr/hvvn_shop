import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/order";

const Schema = z.object({
  email: emailSchema,
  source: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });

  const sb = createSupabaseServiceClient();
  // Idempotent: re-subscribing reactivates the row (unique on email).
  const { error } = await sb.from("email_subscribers").upsert(
    {
      email: parsed.data.email,
      source: parsed.data.source ?? "modal",
      is_active: true,
      unsubscribed_at: null,
    },
    { onConflict: "email" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
