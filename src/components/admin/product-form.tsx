"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { MultiImageUploader, type DetailImage } from "./multi-image-uploader";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/admin";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { fieldErrors } from "@/lib/validation/order";
import type { Product } from "@/types";

export function ProductForm({
  product,
  initialImages = [],
}: {
  product?: Product;
  initialImages?: DetailImage[];
}) {
  const router = useRouter();
  const editing = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    price_krw: product?.price_krw ?? 0,
    stock: product?.stock ?? 0,
    is_published: product?.is_published ?? true,
    short_description: product?.short_description ?? "",
    description_html: product?.description_html ?? "",
    thumbnail_url: product?.thumbnail_url ?? "",
  });
  const [images, setImages] = useState<DetailImage[]>(initialImages);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: ProductInput = {
      slug: form.slug,
      name: form.name,
      price_krw: Number(form.price_krw) || 0,
      stock: Number(form.stock) || 0,
      is_published: form.is_published,
      short_description: form.short_description || null,
      description_html: form.description_html || null,
      thumbnail_url: form.thumbnail_url || null,
      images,
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await updateProduct(product.id, parsed.data);
      } else {
        await createProduct(parsed.data);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "저장 실패" });
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm("이 상품을 삭제할까요? 되돌릴 수 없습니다.")) return;
    setSubmitting(true);
    try {
      await deleteProduct(product.id);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "삭제 실패" });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Field label="상품명" required error={errors.name}>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="slug (URL용, 소문자/숫자/하이픈)" required error={errors.slug}>
          <input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="custom-cap" />
        </Field>
        <Field label="가격 (KRW)" required error={errors.price_krw}>
          <input
            className="input"
            type="number"
            min={0}
            value={form.price_krw}
            onChange={(e) => set("price_krw", Number(e.target.value))}
          />
        </Field>
        <Field label="재고" required error={errors.stock}>
          <input
            className="input"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="짧은 설명" error={errors.short_description}>
        <input
          className="input"
          value={form.short_description}
          onChange={(e) => set("short_description", e.target.value)}
        />
      </Field>

      <Field label="상세 설명" error={errors.description_html}>
        <textarea
          className="input-box"
          rows={6}
          value={form.description_html}
          onChange={(e) => set("description_html", e.target.value)}
          placeholder="상품 설명을 입력하세요. 줄바꿈은 그대로 반영됩니다."
        />
      </Field>

      <div>
        <span className="label">메인 이미지</span>
        <ImageUploader value={form.thumbnail_url} onUploaded={(url) => set("thumbnail_url", url)} />
      </div>

      <div>
        <span className="label">상세 이미지</span>
        <MultiImageUploader images={images} onChange={setImages} />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => set("is_published", e.target.checked)}
        />
        게시 (스토어에 노출)
      </label>

      {errors._form && <div className="text-sm text-accent">{errors._form}</div>}

      <div className="flex items-center gap-3">
        <button className="btn" disabled={submitting}>
          {submitting ? "저장 중..." : editing ? "수정 저장" : "상품 등록"}
        </button>
        {editing && (
          <button type="button" onClick={onDelete} disabled={submitting} className="btn-ghost text-accent">
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
