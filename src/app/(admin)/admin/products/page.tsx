import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminProductList } from "@/components/features/admin-product-list";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="chrome-text text-2xl">상품 {products.length}</h2>
        <Link href="/admin/products/new" className="btn">
          + 새 상품
        </Link>
      </div>
      <p className="text-xs text-muted mb-6">▲▼ 버튼으로 스토어 노출 순서를 조절할 수 있어요.</p>

      <AdminProductList initial={products} />
    </div>
  );
}
