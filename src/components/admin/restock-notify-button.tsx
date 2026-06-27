"use client";

import { useState } from "react";
import { notifyRestock } from "@/lib/api/admin";

export function RestockNotifyButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    if (!confirm("이 상품의 재입고 대기자들에게 알림 메일을 발송할까요?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await notifyRestock(productId);
      setMsg(res.message ?? `${res.sent}명에게 발송했습니다.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "발송 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={run} disabled={busy} className="btn-outline">
        {busy ? "발송 중..." : "재입고 알림 발송"}
      </button>
      {msg && <span className="text-sm text-muted">{msg}</span>}
    </div>
  );
}
