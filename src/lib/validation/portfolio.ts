import { z } from "zod";

/** Admin portfolio create/update payload. */
export const portfolioSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요"),
  content: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  // ISO date string (yyyy-mm-dd) or null.
  work_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD 입니다")
    .nullable()
    .optional(),
  main_url: z.string().min(1, "메인 이미지를 업로드해주세요"),
  is_published: z.boolean(),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
