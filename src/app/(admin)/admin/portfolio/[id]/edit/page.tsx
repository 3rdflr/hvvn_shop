import { notFound } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { PortfolioForm } from "@/components/admin/portfolio-form";
import type { PortfolioItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("portfolio_items").select("*").eq("id", id).maybeSingle<PortfolioItem>();
  if (!data) notFound();

  return (
    <div>
      <h2 className="chrome-text text-2xl mb-6">작업 수정</h2>
      <PortfolioForm item={data} />
    </div>
  );
}
