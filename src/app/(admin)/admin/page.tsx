import Link from "next/link";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatKRW } from "@/lib/format";

// Authenticated via proxy/middleware → service role for admin queries (bypass RLS).
export default async function AdminDashboard() {
  const sb = createSupabaseServiceClient();
  const [pending, products, lowStock, openInq, subscribers] = await Promise.all([
    sb.from("orders").select("id, total_krw", { count: "exact" }).eq("status", "pending_payment"),
    sb.from("products").select("id", { count: "exact" }),
    sb
      .from("products")
      .select("id, name, stock")
      .lte("stock", 3)
      .order("stock", { ascending: true })
      .limit(5),
    sb.from("inquiries").select("id", { count: "exact" }).eq("status", "open"),
    sb.from("email_subscribers").select("id", { count: "exact" }).eq("is_active", true),
  ]);

  const pendingTotal = (pending.data ?? []).reduce((s, o) => s + (o.total_krw ?? 0), 0);
  type LowStock = { id: string; name: string; stock: number };
  const low = (lowStock.data ?? []) as LowStock[];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card
        title="입금 대기 주문"
        value={String(pending.count ?? 0)}
        sub={formatKRW(pendingTotal)}
        href="/admin/orders?status=pending_payment"
      />
      <Card title="등록 상품" value={String(products.count ?? 0)} href="/admin/products" />
      <Card title="미답변 문의" value={String(openInq.count ?? 0)} href="/admin/inquiries" />
      <Card title="구독자" value={String(subscribers.count ?? 0)} href="/admin/subscribers" />

      <div className="md:col-span-2 border border-line p-6">
        <div className="eyebrow mb-3">— Low stock</div>
        <ul className="divide-y divide-line">
          {low.map((p) => (
            <li key={p.id} className="py-2 flex justify-between text-sm">
              <Link href={`/admin/products/${p.id}/edit`} className="underline">
                {p.name}
              </Link>
              <span className={p.stock === 0 ? "text-accent" : ""}>재고 {p.stock}</span>
            </li>
          ))}
          {low.length === 0 && <li className="py-2 text-sm text-muted">재고 부족 상품 없음</li>}
        </ul>
      </div>

      <div className="md:col-span-2 border border-line p-6">
        <div className="eyebrow mb-3">— Quick actions</div>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/admin/products/new" className="underline">
              + 새 상품 등록
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="underline">
              계좌·배송비 수정
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  sub,
  href,
}: {
  title: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="border border-line p-6 h-full">
      <div className="eyebrow">{title}</div>
      <div className="chrome-text text-4xl mt-2">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
