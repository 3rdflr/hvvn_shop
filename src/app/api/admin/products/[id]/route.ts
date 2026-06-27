import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { productSchema } from "@/lib/validation/product";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "잘못된 입력", issues: parsed.error.issues }, { status: 400 });
  const { images, ...patch } = parsed.data;

  const svc = createSupabaseServiceClient();
  const { error } = await svc
    .from("products")
    .update({
      ...patch,
      thumbnail_url: patch.thumbnail_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace the detail-image set when provided.
  if (images) {
    await svc.from("product_images").delete().eq("product_id", id);
    if (images.length > 0) {
      const { error: imgErr } = await svc
        .from("product_images")
        .insert(images.map((i) => ({ ...i, product_id: id })));
      if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 500 });
    }
  }

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
  const { error } = await svc.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
