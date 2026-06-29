import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

const Schema = z.object({ ids: z.array(z.string().uuid()).min(1) });

/**
 * Persists the admin's product display order. The client sends the full ordered
 * list of product ids; we write sort_order = index for each, so the order is
 * fully normalised on every save (no drift from equal/legacy values).
 */
export async function POST(req: Request) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const updates = parsed.data.ids.map((id, index) =>
    svc.from("products").update({ sort_order: index }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
