"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "@/lib/api/storefront";

/** In-drawer order confirmation: order number + bank transfer instructions. */
export function OrderCompletion({ orderNumber }: { orderNumber: string }) {
  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-2">— Order placed</div>
        <h2 className="chrome-text text-3xl">주문이 접수되었습니다.</h2>
        <p className="text-sm text-muted mt-2">아래 계좌로 입금이 확인되면 배송이 시작됩니다.</p>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <span className="text-muted">주문번호</span>
        <span className="font-mono select-all">{orderNumber}</span>
      </div>

      <div className="border border-line bg-sand/40 p-5">
        <div className="eyebrow mb-3">— Bank transfer</div>
        {settings?.bank_account_number ? (
          <>
            <div className="font-serif text-xl">{settings.bank_name}</div>
            <div className="font-mono text-xl tracking-wider mt-1 select-all">
              {settings.bank_account_number}
            </div>
            <div className="text-sm text-muted mt-1">예금주 {settings.bank_account_holder}</div>
            <p className="text-xs text-muted mt-4">
              주문 후 3일 이내 입금되지 않으면 자동 취소될 수 있습니다.
              <br />
              입금자명이 다를 경우 주문번호({orderNumber})를 메모로 함께 입력해주세요.
            </p>
          </>
        ) : (
          <div className="text-sm text-muted">관리자가 계좌 정보를 등록해야 합니다.</div>
        )}
      </div>

      <p className="text-xs text-muted">
        주문 내역은 상단 <span className="text-chrome">Orders</span> 탭에서 이름·전화번호로 다시
        확인할 수 있어요.
      </p>
    </div>
  );
}
