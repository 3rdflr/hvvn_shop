import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/order";

const Schema = z.object({ product_id: z.string().uuid(), email: emailSchema });

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { error } = await sb
    .from("waitlist")
    .upsert(
      { product_id: parsed.data.product_id, email: parsed.data.email },
      { onConflict: "product_id,email" }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
