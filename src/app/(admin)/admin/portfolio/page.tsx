import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { AdminPortfolioList } from "@/components/features/admin-portfolio-list";
import type { PortfolioItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("portfolio_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  const items = (data ?? []) as PortfolioItem[];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="chrome-text text-2xl">포트폴리오 {items.length}</h2>
        <Link href="/admin/portfolio/new" className="btn">
          + 새 작업
        </Link>
      </div>
      <p className="text-xs text-muted mb-6">▲▼ 버튼으로 포트폴리오 노출 순서를 조절할 수 있어요.</p>

      <AdminPortfolioList initial={items} />
    </div>
  );
}
