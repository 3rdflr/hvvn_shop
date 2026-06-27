import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("settings")
    .select("shipping_fee_default, shipping_fee_remote")
    .eq("id", 1)
    .maybeSingle();
  return NextResponse.json({
    default: data?.shipping_fee_default ?? 4000,
    remote: data?.shipping_fee_remote ?? 7000,
  });
}
