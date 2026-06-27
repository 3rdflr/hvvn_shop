import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { Inquiry } from "@/types";

export default async function AdminInquiriesPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const inquiries = (data ?? []) as Inquiry[];

  return (
    <div>
      <h2 className="chrome-text text-2xl mb-6">문의 {inquiries.length}</h2>
      <ul className="space-y-4">
        {inquiries.map((q) => (
          <li key={q.id} className="border border-line p-4">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div className="text-sm">
                <span className="text-chrome">{q.customer_name}</span>
                <span className="text-muted"> · {q.customer_email}</span>
              </div>
              <div className="text-xs text-muted whitespace-nowrap">{formatDate(q.created_at)}</div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{q.message}</p>
            <div className="mt-2 text-[11px] tracking-widest2 uppercase text-muted">
              {q.status}
              {q.customer_phone ? ` · ${q.customer_phone}` : ""}
            </div>
          </li>
        ))}
        {inquiries.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">문의가 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
