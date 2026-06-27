import { z } from "zod";

/**
 * Shared order/customer validation — imported by BOTH the checkout form (client)
 * and the /api/orders route (server) so the rules can never drift apart.
 * Addresses the "garbage customer info still saves" bug.
 */

// 휴대폰: 하이픈/공백 제거 후 010/011/016/017/018/019 + 7~8자리
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^01[016789]\d{7,8}$/, "올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)")
  );

// 우편번호: 5자리 숫자
export const postcodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "우편번호는 5자리 숫자입니다");

export const emailSchema = z
  .string()
  .trim()
  .email("올바른 이메일 주소를 입력해주세요");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "이름을 2자 이상 입력해주세요")
  .max(40, "이름이 너무 깁니다");

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  unit_price_krw: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(99),
});

/** Full checkout payload. */
export const checkoutSchema = z.object({
  customer_name: nameSchema,
  customer_phone: phoneSchema,
  // 주문 확인 메일 발송을 위해 이메일을 필수로 승격 (구버전은 optional 이었음)
  customer_email: emailSchema,
  shipping_postcode: postcodeSchema,
  shipping_address1: z.string().trim().min(2, "주소를 입력해주세요").max(120),
  shipping_address2: z.string().trim().max(120).optional().or(z.literal("")),
  shipping_memo: z.string().trim().max(200).optional().or(z.literal("")),
  depositor_name: z
    .string()
    .trim()
    .min(2, "입금자명을 입력해주세요")
    .max(40),
  items: z.array(cartItemSchema).min(1, "장바구니가 비어 있습니다"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Field-level errors keyed by field name, for inline form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
