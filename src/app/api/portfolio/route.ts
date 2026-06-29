import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PortfolioItem } from "@/types";

export const dynamic = "force-dynamic";

/** Public: published portfolio items in admin order. */
export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("portfolio_items")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []) as PortfolioItem[] });
}
