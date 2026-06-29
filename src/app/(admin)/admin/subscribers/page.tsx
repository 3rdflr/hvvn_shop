import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { EmailSubscriber } from "@/types";

export default async function AdminSubscribersPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("email_subscribers")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);
  const subs = (data ?? []) as EmailSubscriber[];

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="chrome-text text-2xl">구독자 {subs.length}</h2>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {subs.map((s) => (
          <li key={s.id} className="py-3 flex items-center justify-between gap-3 text-sm">
            <span>{s.email}</span>
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
