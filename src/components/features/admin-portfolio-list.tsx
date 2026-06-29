"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { reorderPortfolio } from "@/lib/api/admin";
import type { PortfolioItem } from "@/types";

/** Admin portfolio list with up/down reordering (mirrors AdminProductList). */
export function AdminPortfolioList({ initial }: { initial: PortfolioItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length || saving) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next);
    setError(null);
    setSaving(true);
    try {
      await reorderPortfolio(next.map((p) => p.id));
      router.refresh();
    } catch (e) {
      setItems(items);
      setError(e instanceof Error ? e.message : "순서 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <ul className="divide-y divide-line border-y border-line">
        <li className="py-10 text-center text-muted text-sm">등록된 작업이 없습니다.</li>
      </ul>
    );
  }

  return (
    <>
      {error && <div className="mb-3 text-sm text-accent">{error}</div>}
      <ul className="divide-y divide-line border-y border-line">
        {items.map((p, i) => (
          <li key={p.id} className="py-4 flex items-center gap-4">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="위로"
                disabled={i === 0 || saving}
                onClick={() => move(i, -1)}
                className="w-7 h-6 flex items-center justify-center text-chrome hover:bg-velvetGlow/40 disabled:opacity-25 disabled:pointer-events-none"
              >
                ▲
              </button>
              <button
                type="button"
                aria-label="아래로"
                disabled={i === items.length - 1 || saving}
                onClick={() => move(i, 1)}
                className="w-7 h-6 flex items-center justify-center text-chrome hover:bg-velvetGlow/40 disabled:opacity-25 disabled:pointer-events-none"
              >
                ▼
              </button>
            </div>

            <div className="relative w-14 h-14 shrink-0 border border-line bg-velvetGlow/20">
              {p.main_url && (
                <Image src={p.main_url} alt="" fill className="object-cover" sizes="56px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/portfolio/${p.id}/edit`}
                className="chrome-text text-lg hover:opacity-80"
              >
                {p.title}
              </Link>
              <div className="text-xs text-muted">
                {[p.type, p.work_date].filter(Boolean).join(" · ") || "—"}
                {!p.is_published && <span className="text-accent"> · 비공개</span>}
              </div>
            </div>
            <Link href={`/admin/portfolio/${p.id}/edit`} className="btn-ghost underline">
              수정
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
