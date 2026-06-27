"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/lib/api/admin";
import type { Settings } from "@/types";

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    bank_name: settings?.bank_name ?? "",
    bank_account_number: settings?.bank_account_number ?? "",
    bank_account_holder: settings?.bank_account_holder ?? "",
    shipping_fee_default: settings?.shipping_fee_default ?? 4000,
    shipping_fee_remote: settings?.shipping_fee_remote ?? 7000,
    instagram_url: settings?.instagram_url ?? "",
    contact_email: settings?.contact_email ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErr(null);
    try {
      await updateSettings({
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        bank_account_holder: form.bank_account_holder || null,
        shipping_fee_default: Number(form.shipping_fee_default) || 0,
        shipping_fee_remote: Number(form.shipping_fee_remote) || 0,
        instagram_url: form.instagram_url || null,
        contact_email: form.contact_email || null,
      });
      setStatus("saved");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "저장 실패");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-8">
      <section className="space-y-5">
        <div className="eyebrow">— 무통장입금 계좌</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="은행">
            <input className="input" value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} />
          </Field>
          <Field label="계좌번호" className="sm:col-span-2">
            <input
              className="input"
              value={form.bank_account_number}
              onChange={(e) => set("bank_account_number", e.target.value)}
            />
          </Field>
          <Field label="예금주">
            <input
              className="input"
              value={form.bank_account_holder}
              onChange={(e) => set("bank_account_holder", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <div className="eyebrow">— 배송비</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="기본 배송비">
            <input
              className="input"
              type="number"
              min={0}
              value={form.shipping_fee_default}
              onChange={(e) => set("shipping_fee_default", Number(e.target.value))}
            />
          </Field>
          <Field label="도서산간 배송비">
            <input
              className="input"
              type="number"
              min={0}
              value={form.shipping_fee_remote}
              onChange={(e) => set("shipping_fee_remote", Number(e.target.value))}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5">
        <div className="eyebrow">— 연락처</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instagram URL">
            <input
              className="input"
              value={form.instagram_url}
              onChange={(e) => set("instagram_url", e.target.value)}
            />
          </Field>
          <Field label="문의 이메일">
            <input
              className="input"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
            />
          </Field>
        </div>
      </section>

      {err && <div className="text-sm text-accent">{err}</div>}

      <div className="flex items-center gap-3">
        <button className="btn" disabled={status === "saving"}>
          {status === "saving" ? "저장 중..." : "저장"}
        </button>
        {status === "saved" && <span className="text-sm text-muted">저장됨 ✓</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
