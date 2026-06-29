import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

const Schema = z.object({
  bank_name: z.string().nullable().optional(),
  bank_account_number: z.string().nullable().optional(),
  bank_account_holder: z.string().nullable().optional(),
  shipping_fee_default: z.number().int().nonnegative(),
  shipping_fee_remote: z.number().int().nonnegative(),
  free_shipping_threshold: z.number().int().nonnegative(),
  instagram_url: z.string().nullable().optional(),
  contact_email: z.string().nullable().optional(),
  bg_youtube_url: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "잘못된 입력", issues: parsed.error.issues }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { error } = await svc
    .from("settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
