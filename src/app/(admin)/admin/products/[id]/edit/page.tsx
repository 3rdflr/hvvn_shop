import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { RestockNotifyButton } from "@/components/admin/restock-notify-button";
import type { DetailImage } from "@/components/admin/multi-image-uploader";
import type { Product, ProductImage } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createSupabaseServiceClient();

  const { data: product } = await sb.from("products").select("*").eq("id", id).maybeSingle<Product>();
  if (!product) notFound();

  const { data: imgs } = await sb
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("position", { ascending: true });

  const initialImages: DetailImage[] = ((imgs ?? []) as ProductImage[]).map((i) => ({
    url: i.url,
    alt: i.alt,
    position: i.position,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="chrome-text text-2xl">{product.name} 수정</h2>
        <RestockNotifyButton productId={product.id} />
      </div>
      <ProductForm product={product} initialImages={initialImages} />
    </div>
  );
}
