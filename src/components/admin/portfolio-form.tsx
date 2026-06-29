"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from "@/lib/api/admin";
import { portfolioSchema, type PortfolioInput } from "@/lib/validation/portfolio";
import { fieldErrors } from "@/lib/validation/order";
import type { PortfolioItem } from "@/types";

export function PortfolioForm({ item }: { item?: PortfolioItem }) {
  const router = useRouter();
  const editing = !!item;

  const [form, setForm] = useState({
    title: item?.title ?? "",
    type: item?.type ?? "",
    work_date: item?.work_date ?? "",
    content: item?.content ?? "",
    main_url: item?.main_url ?? "",
    is_published: item?.is_published ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: PortfolioInput = {
      title: form.title,
      type: form.type || null,
      work_date: form.work_date || null,
      content: form.content || null,
      main_url: form.main_url,
      is_published: form.is_published,
    };

    const parsed = portfolioSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updatePortfolioItem(item.id, parsed.data);
      } else {
        await createPortfolioItem(parsed.data);
      }
      router.push("/admin/portfolio");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "저장 실패" });
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!item) return;
    if (!confirm("이 작업을 삭제할까요? 되돌릴 수 없습니다.")) return;
    setSubmitting(true);
    try {
      await deletePortfolioItem(item.id);
      router.push("/admin/portfolio");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "삭제 실패" });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label="제목" required error={errors.title}>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="분류 (type)" error={errors.type}>
          <input
            className="input"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            placeholder="Editorial / Commission ..."
          />
        </Field>
        <Field label="작업 날짜" error={errors.work_date}>
          <input
            className="input"
            type="date"
            value={form.work_date}
            onChange={(e) => set("work_date", e.target.value)}
          />
        </Field>
      </div>

      <Field label="상세 내용 (모달 본문)" error={errors.content}>
        <textarea
          className="input-box"
          rows={6}
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="작업 설명, 비하인드 등"
        />
      </Field>

      <div>
        <span className="label">
          메인 이미지 (gif/img) <span className="text-accent">*</span>
        </span>
        <ImageUploader value={form.main_url} onUploaded={(url) => set("main_url", url)} />
        {errors.main_url && <span className="field-error">{errors.main_url}</span>}
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => set("is_published", e.target.checked)}
        />
        게시 (포트폴리오에 노출)
      </label>

      {errors._form && <div className="text-sm text-accent">{errors._form}</div>}

      <div className="flex items-center gap-3">
        <button className="btn" disabled={submitting}>
          {submitting ? "저장 중..." : editing ? "수정 저장" : "작업 등록"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="btn-ghost text-accent"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
