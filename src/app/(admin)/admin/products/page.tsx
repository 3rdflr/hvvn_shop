import Link from "next/link";
import Image from "next/image";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="chrome-text text-2xl">상품 {products.length}</h2>
        <Link href="/admin/products/new" className="btn">
          + 새 상품
        </Link>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {products.map((p) => (
          <li key={p.id} className="py-4 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0 border border-line bg-velvetGlow/20">
              {p.thumbnail_url && (
                <Image src={p.thumbnail_url} alt="" fill className="object-cover" sizes="56px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/admin/products/${p.id}/edit`} className="chrome-text text-lg hover:opacity-80">
                {p.name}
              </Link>
              <div className="text-xs text-muted">
                {p.slug} · {formatKRW(p.price_krw)} · 재고 {p.stock}
                {!p.is_published && <span className="text-accent"> · 비공개</span>}
              </div>
            </div>
            <Link href={`/admin/products/${p.id}/edit`} className="btn-ghost underline">
              수정
            </Link>
          </li>
        ))}
        {products.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">등록된 상품이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
