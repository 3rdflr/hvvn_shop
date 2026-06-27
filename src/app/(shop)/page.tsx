import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/features/product-card";
import type { Product } from "@/types";

// Always show the latest products/thumbnails after admin edits.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: productsData, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true }); // stable tiebreaker → no reshuffle on refresh
  if (error) {
    // Surfaces RLS / connection problems in the dev terminal instead of silently
    // rendering an empty grid.
    console.error("[home] products query failed:", error.message);
  }
  const products = (productsData ?? []) as Product[];

  return (
    <section className="container-page pt-10 md:pt-16 pb-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 max-w-4xl mx-auto">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted">등록된 상품이 없습니다.</div>
        )}
      </div>
    </section>
  );
}
