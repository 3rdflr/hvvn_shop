import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  email: string;
  notified_at: string | null;
  created_at: string;
  products: { name: string } | { name: string }[] | null;
};

function productName(p: Row["products"]): string {
  if (!p) return "—";
  return Array.isArray(p) ? (p[0]?.name ?? "—") : p.name;
}

export default async function AdminWaitlistPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("waitlist")
    .select("id, email, notified_at, created_at, products:product_id(name)")
    .order("created_at", { ascending: false })
    .limit(1000);
  const rows = (data ?? []) as Row[];
  const pending = rows.filter((r) => !r.notified_at);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="chrome-text text-2xl">재입고 알림 {rows.length}</h2>
        <span className="text-xs text-muted">미발송 {pending.length}</span>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <li key={r.id} className="py-3 flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <span className="block truncate">{r.email}</span>
              <span className="text-xs text-muted">{productName(r.products)}</span>
            </div>
            <span className="text-xs whitespace-nowrap text-right">
              {r.notified_at ? (
                <span className="text-muted">발송됨 · {formatDate(r.notified_at)}</span>
              ) : (
                <span className="text-chrome">대기 · {formatDate(r.created_at)}</span>
              )}
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">재입고 알림 신청이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
