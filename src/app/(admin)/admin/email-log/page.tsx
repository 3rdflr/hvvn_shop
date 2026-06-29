import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { EmailLog } from "@/types";

export const dynamic = "force-dynamic";

const TEMPLATE_LABEL: Record<string, string> = {
  order_confirmation: "주문확인",
  shipping: "배송",
  restock: "재입고",
  inquiry: "문의",
  broadcast: "공지",
};

export default async function AdminEmailLogPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb
    .from("email_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  const logs = (data ?? []) as EmailLog[];
  const failed = logs.filter((l) => l.status === "failed").length;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="chrome-text text-2xl">이메일 로그 {logs.length}</h2>
        {failed > 0 && <span className="text-xs text-accent">실패 {failed}</span>}
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {logs.map((l) => (
          <li key={l.id} className="py-3 flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] tracking-widest2 uppercase px-1.5 py-0.5 border ${
                    l.status === "sent"
                      ? "border-chrome/50 text-chrome"
                      : "border-accent/60 text-accent"
                  }`}
                >
                  {l.status === "sent" ? "발송" : "실패"}
                </span>
                <span className="text-muted text-xs">{TEMPLATE_LABEL[l.template] ?? l.template}</span>
              </div>
              <span className="block truncate mt-1">{l.to_email}</span>
              {l.error && <span className="block text-xs text-accent mt-0.5 break-words">{l.error}</span>}
            </div>
            <span className="text-xs text-muted whitespace-nowrap text-right">
              {l.ref_id && <span className="block">{l.ref_id}</span>}
              {formatDate(l.created_at)}
            </span>
          </li>
        ))}
        {logs.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">발송 기록이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
