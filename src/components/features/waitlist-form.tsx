"use client";

import { useState } from "react";
import { useJoinWaitlist } from "@/hooks/use-storefront-mutations";

export function WaitlistForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const waitlist = useJoinWaitlist();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    waitlist.mutate({ product_id: productId, email });
  }

  if (waitlist.isSuccess) {
    return <div className="text-sm">등록되었습니다. 재입고되면 알려드릴게요.</div>;
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="label" htmlFor="waitlist-email">
          사고 싶어요 — 재입고 알림
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@domain.com"
          className="input"
        />
      </div>
      <button disabled={waitlist.isPending} className="btn">
        {waitlist.isPending ? "..." : "Notify me"}
      </button>
      {waitlist.isError && (
        <div className="text-xs text-accent">{(waitlist.error as Error).message}</div>
      )}
    </form>
  );
}
