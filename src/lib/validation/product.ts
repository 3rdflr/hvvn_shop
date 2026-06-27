import { z } from "zod";

export const productImageSchema = z.object({
  // Accept both absolute (uploaded) and relative (/images/...) paths.
  url: z.string().min(1),
  alt: z.string().nullable().optional(),
  position: z.number().int().nonnegative(),
});

/** Admin product create/update payload (main image + detail images). */
export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "slug를 입력해주세요")
    .regex(/^[a-z0-9-]+$/, "slug는 소문자/숫자/하이픈만 가능합니다"),
  name: z.string().trim().min(1, "상품명을 입력해주세요"),
  price_krw: z.number().int().nonnegative(),
  short_description: z.string().nullable().optional(),
  description_html: z.string().nullable().optional(),
  stock: z.number().int().nonnegative(),
  is_published: z.boolean(),
  thumbnail_url: z.string().nullable().optional(),
  images: z.array(productImageSchema).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
