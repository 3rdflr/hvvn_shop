import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { portfolioSchema } from "@/lib/validation/portfolio";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = portfolioSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "잘못된 입력", issues: parsed.error.issues }, { status: 400 });

  const svc = createSupabaseServiceClient();
  const { error } = await svc
    .from("portfolio_items")
    .update({
      ...parsed.data,
      work_date: parsed.data.work_date || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("portfolio_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
