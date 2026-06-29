import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

const Schema = z.object({ ids: z.array(z.string().uuid()).min(1) });

/** Persist portfolio display order (sort_order = index over the supplied ids). */
export async function POST(req: Request) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const results = await Promise.all(
    parsed.data.ids.map((id, index) =>
      svc.from("portfolio_items").update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
