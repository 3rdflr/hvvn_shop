import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Server-side guard against the "무한 문의 전송" issue. Inquiries are throttled
 * per order (or per email when there's no order) using the DB as the source of
 * truth — no in-memory state, so it works across serverless instances.
 */

const COOLDOWN_MS = 60_000; // 같은 주문/이메일 60초 내 1건
const DAILY_MAX = 5; // 같은 주문/이메일 24시간 내 최대 5건
const WINDOW_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult = { ok: true } | { ok: false; status: number; error: string };

export async function checkInquiryRateLimit(params: {
  orderId?: string | null;
  email: string;
  message: string;
}): Promise<RateLimitResult> {
  const sb = createSupabaseServiceClient();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  let query = sb
    .from("inquiries")
    .select("message, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(DAILY_MAX + 5);

  // Prefer per-order scoping; fall back to per-email when the inquiry isn't tied
  // to an order.
  query = params.orderId
    ? query.eq("order_id", params.orderId)
    : query.eq("customer_email", params.email);

  const { data, error } = await query;
  // Availability-first: if the check itself fails, don't block a legitimate user.
  if (error) return { ok: true };

  const recent = data ?? [];

  if (recent.length >= DAILY_MAX) {
    return {
      ok: false,
      status: 429,
      error: "문의 한도를 초과했습니다. 24시간 후 다시 시도해주세요.",
    };
  }

  const latest = recent[0];
  if (latest && Date.now() - new Date(latest.created_at).getTime() < COOLDOWN_MS) {
    return {
      ok: false,
      status: 429,
      error: "조금 전 문의가 접수되었습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  const normalized = params.message.trim();
  if (recent.some((r) => r.message.trim() === normalized)) {
    return {
      ok: false,
      status: 409,
      error: "이미 동일한 내용의 문의가 접수되어 있습니다.",
    };
  }

  return { ok: true };
}
