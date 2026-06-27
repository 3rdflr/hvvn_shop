import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Public, non-sensitive store settings (bank transfer info + shipping fees). */
export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("settings")
    .select(
      "bank_name, bank_account_number, bank_account_holder, shipping_fee_default, shipping_fee_remote, instagram_url, contact_email, bg_youtube_url"
    )
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({
    bank_name: data?.bank_name ?? null,
    bank_account_number: data?.bank_account_number ?? null,
    bank_account_holder: data?.bank_account_holder ?? null,
    shipping_fee_default: data?.shipping_fee_default ?? 4000,
    shipping_fee_remote: data?.shipping_fee_remote ?? 7000,
    instagram_url: data?.instagram_url ?? null,
    contact_email: data?.contact_email ?? null,
    bg_youtube_url: data?.bg_youtube_url ?? null,
  });
}
