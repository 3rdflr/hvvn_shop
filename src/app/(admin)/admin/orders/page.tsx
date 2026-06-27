import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { formatKRW, formatDate } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ORDER_STATUS_LABEL, type Order, type OrderItem, type OrderStatus } from "@/types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const sb = createSupabaseServiceClient();

  let query = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  if (status && status in ORDER_STATUS_LABEL) query = query.eq("status", status);
  const { data: ordersData } = await query;
  const orders = (ordersData ?? []) as Order[];

  const ids = orders.map((o) => o.id);
  const { data: itemsData } = ids.length
    ? await sb.from("order_items").select("*").in("order_id", ids)
    : { data: [] };
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const it of (itemsData ?? []) as OrderItem[]) {
    const list = itemsByOrder.get(it.order_id) ?? [];
    list.push(it);
    itemsByOrder.set(it.order_id, list);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h2 className="chrome-text text-2xl">주문 {orders.length}</h2>
        <div className="flex gap-3 text-[12px] tracking-widest2 uppercase">
          <a href="/admin/orders" className={!status ? "text-chrome" : "text-muted hover:text-chrome"}>
            전체
          </a>
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <a
              key={s}
              href={`/admin/orders?status=${s}`}
              className={status === s ? "text-chrome" : "text-muted hover:text-chrome"}
            >
              {ORDER_STATUS_LABEL[s]}
            </a>
          ))}
        </div>
      </div>

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="border border-line p-4 sm:p-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <div className="font-mono text-sm text-chrome">{o.order_number}</div>
                <div className="text-xs text-muted">{formatDate(o.created_at)}</div>
              </div>
              <OrderStatusSelect orderId={o.id} status={o.status} />
            </div>

            <div className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="text-muted">
                주문자{" "}
                <span className="text-chrome">
                  {o.customer_name} · {o.customer_phone}
                </span>
              </div>
              <div className="text-muted">
                입금자 <span className="text-chrome">{o.depositor_name}</span>
              </div>
              <div className="text-muted sm:col-span-2">
                배송지{" "}
                <span className="text-chrome">
                  ({o.shipping_postcode}) {o.shipping_address1} {o.shipping_address2 ?? ""}
                </span>
              </div>
              {o.customer_email && (
                <div className="text-muted sm:col-span-2">
                  이메일 <span className="text-chrome">{o.customer_email}</span>
                </div>
              )}
              {o.shipping_memo && (
                <div className="text-muted sm:col-span-2">
                  메모 <span className="text-chrome">{o.shipping_memo}</span>
                </div>
              )}
            </div>

            <ul className="mt-3 text-sm divide-y divide-line border-t border-line">
              {(itemsByOrder.get(o.id) ?? []).map((it) => (
                <li key={it.id} className="py-2 flex justify-between">
                  <span>
                    {it.product_name_snapshot} × {it.quantity}
                  </span>
                  <span>{formatKRW(it.unit_price_krw * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted">배송비 {formatKRW(o.shipping_fee_krw)}</span>
              <span className="chrome-text text-lg">{formatKRW(o.total_krw)}</span>
            </div>
          </li>
        ))}
        {orders.length === 0 && (
          <li className="py-10 text-center text-muted text-sm">주문이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
