import { Resend } from "resend";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  template: string; // 'order_confirmation' | 'shipping' | 'restock' | ...
  refId?: string; // order number / product id, for the audit log
};

export type SendEmailResult = { ok: boolean; skipped?: boolean; error?: string };

/**
 * Sends a transactional email via Resend and records the attempt in email_log.
 * Designed to never throw into the caller's flow — a failed email must not roll
 * back an order. If RESEND_API_KEY/RESEND_FROM are unset, it logs a skip.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    await logEmail(params, "failed", undefined, "RESEND_API_KEY/RESEND_FROM 미설정");
    return { ok: false, skipped: true, error: "email not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      await logEmail(params, "failed", undefined, error.message);
      return { ok: false, error: error.message };
    }
    await logEmail(params, "sent", data?.id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "send failed";
    await logEmail(params, "failed", undefined, message);
    return { ok: false, error: message };
  }
}

async function logEmail(
  params: SendEmailParams,
  status: "sent" | "failed",
  providerId?: string,
  error?: string
) {
  try {
    const svc = createSupabaseServiceClient();
    await svc.from("email_log").insert({
      to_email: params.to,
      template: params.template,
      ref_id: params.refId ?? null,
      provider_id: providerId ?? null,
      status,
      error: error ?? null,
    });
  } catch {
    // Logging must never break the caller.
  }
}
