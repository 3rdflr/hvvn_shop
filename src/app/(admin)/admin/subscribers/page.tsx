import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { EmailSubscriber } from "@/types";

export default async function AdminSubscribersPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("email_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  const subs = (data ?? []) as EmailSubscriber[];
  const active = subs.filter((s) => s.is_active);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="chrome-text text-2xl">구독자 {active.length}</h2>
        <span className="text-xs text-muted">전체 {subs.length} (해지 포함)</span>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {subs.map((s) => (
          <li key={s.id} className="py-3 flex items-center justify-between gap-3 text-sm">
            <span className={s.is_active ? "" : "text-muted line-through"}>{s.email}</span>
            <span className="text-xs text-muted whitespace-nowrap">
              {s.source ?? "—"} · {formatDate(s.created_at)}
            </span>
          </li>
        ))}
        {subs.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">구독자가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
