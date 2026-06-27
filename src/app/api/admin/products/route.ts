import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { productSchema } from "@/lib/validation/product";

export async function POST(req: Request) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = productSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "잘못된 입력", issues: parsed.error.issues },
      { status: 400 }
    );
  const { images, ...productData } = parsed.data;

  const svc = createSupabaseServiceClient();
  const { data, error } = await svc
    .from("products")
    .insert({ ...productData, thumbnail_url: productData.thumbnail_url || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (images && images.length > 0) {
    const { error: imgErr } = await svc
      .from("product_images")
      .insert(images.map((i) => ({ ...i, product_id: data.id })));
    if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
