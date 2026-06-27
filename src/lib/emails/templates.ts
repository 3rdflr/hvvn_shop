import { formatKRW } from "@/lib/format";
import type { Order, OrderItem, Settings } from "@/types";

const BG = "#000000";
const PANEL = "#0d0d0d";
const LINE = "#262626";
const TEXT = "#eef0fb";
const MUTED = "#8a8a92";
const CHROME = "#dcdce4";

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="ko"><body style="margin:0;background:${BG};padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:${BG};border:1px solid ${LINE};">
        <tr><td style="padding:28px 28px 8px;">
          <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${MUTED};">HVVN</div>
          <div style="font-size:24px;color:${CHROME};margin-top:6px;letter-spacing:.02em;">${title}</div>
        </td></tr>
        <tr><td style="padding:8px 28px 28px;color:${TEXT};font-size:14px;line-height:1.7;">
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid ${LINE};color:${MUTED};font-size:11px;">
          from hvvn
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:${MUTED};font-size:13px;">${label}</td>
    <td style="padding:6px 0;color:${TEXT};font-size:13px;text-align:right;">${value}</td>
  </tr>`;
}

type EmailItem = Pick<OrderItem, "product_name_snapshot" | "quantity" | "unit_price_krw">;

export function orderConfirmationEmail(args: {
  order: Order;
  items: EmailItem[];
  settings: Pick<Settings, "bank_name" | "bank_account_number" | "bank_account_holder"> | null;
}): { subject: string; html: string } {
  const { order, items, settings } = args;

  const itemRows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${TEXT};font-size:13px;">${it.product_name_snapshot} × ${it.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${TEXT};font-size:13px;text-align:right;">${formatKRW(
            it.unit_price_krw * it.quantity
          )}</td>
        </tr>`
    )
    .join("");

  const bank = settings?.bank_account_number
    ? `<div style="margin-top:20px;background:${PANEL};border:1px solid ${LINE};padding:18px;">
        <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${MUTED};">입금 계좌</div>
        <div style="font-size:18px;color:${CHROME};margin-top:8px;">${settings.bank_name ?? ""}</div>
        <div style="font-size:18px;color:${CHROME};letter-spacing:.04em;margin-top:2px;">${settings.bank_account_number}</div>
        <div style="font-size:13px;color:${MUTED};margin-top:2px;">예금주 ${settings.bank_account_holder ?? ""}</div>
        <div style="font-size:12px;color:${MUTED};margin-top:12px;">입금자명이 다를 경우 주문번호(${order.order_number})를 메모로 함께 입력해주세요.</div>
      </div>`
    : "";

  const body = `
    <p style="margin:0 0 16px;">${order.customer_name}님, 주문이 접수되었습니다.<br/>아래 계좌로 입금이 확인되면 배송이 시작됩니다.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;">
      ${row("주문번호", order.order_number)}
      ${row("입금자명", order.depositor_name)}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;border-top:1px solid ${LINE};">
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      ${row("상품 합계", formatKRW(order.subtotal_krw))}
      ${row("배송비", formatKRW(order.shipping_fee_krw))}
      ${row("<b style='color:" + CHROME + "'>합계</b>", "<b style='color:" + CHROME + "'>" + formatKRW(order.total_krw) + "</b>")}
    </table>
    ${bank}
  `;

  return {
    subject: `[HVVN] 주문이 접수되었습니다 · ${order.order_number}`,
    html: layout("주문 접수", body),
  };
}

export function shippingEmail(args: { order: Order; siteUrl: string }): {
  subject: string;
  html: string;
} {
  const { order, siteUrl } = args;
  const body = `
    <p style="margin:0 0 16px;">${order.customer_name}님, 주문하신 상품이 발송되었습니다.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;">
      ${row("주문번호", order.order_number)}
      ${row(
        "배송지",
        `(${order.shipping_postcode}) ${order.shipping_address1} ${order.shipping_address2 ?? ""}`
      )}
    </table>
    <p style="margin:16px 0 0;"><a href="${siteUrl}" style="color:${CHROME};">스토어로 이동 →</a></p>
  `;
  return {
    subject: `[HVVN] 상품이 발송되었습니다 · ${order.order_number}`,
    html: layout("배송 시작", body),
  };
}

export function restockEmail(args: { productName: string; productUrl: string }): {
  subject: string;
  html: string;
} {
  const { productName, productUrl } = args;
  const body = `
    <p style="margin:0 0 16px;">기다리시던 <b style="color:${CHROME};">${productName}</b> 가 재입고되었습니다.</p>
    <p style="margin:16px 0 0;"><a href="${productUrl}" style="display:inline-block;border:1px solid ${CHROME};color:${BG};background:${CHROME};padding:12px 18px;text-decoration:none;font-size:13px;letter-spacing:.12em;text-transform:uppercase;">지금 보러가기</a></p>
    <p style="margin:18px 0 0;font-size:12px;color:${MUTED};">수량이 한정되어 있어 빠르게 마감될 수 있어요.</p>
  `;
  return {
    subject: `[HVVN] ${productName} 재입고 알림`,
    html: layout("재입고", body),
  };
}
