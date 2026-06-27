"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUi } from "@/store/ui";
import { getPublicSettings } from "@/lib/api/storefront";

/**
 * Site info bottom sheet — business info, refund/exchange policy and privacy
 * policy written to Korean e-commerce law (전자상거래법) defaults. Opaque sheet,
 * scrollable, closed via the X button or ESC.
 *
 * NOTE: the 사업자 정보 fields are placeholders the operator must fill with their
 * real registration details (legally required to display).
 */
export function SiteInfoSheet() {
  const open = useUi((s) => s.infoOpen);
  const close = useUi((s) => s.closeInfo);
  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!open) return null;

  const contact = settings?.contact_email;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center">
      <div onClick={close} className="absolute inset-0 bg-black/85" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="이용안내"
        className="relative w-full bg-black border-t border-line rounded-t-2xl max-h-[88vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 h-14 border-b border-line shrink-0">
          <div className="eyebrow">— 이용안내</div>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="text-chrome/60 hover:text-chrome transition focus:outline-none focus-visible:ring-1 focus-visible:ring-chrome"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-7">
          <div className="mx-auto max-w-2xl space-y-10 text-sm leading-relaxed text-ink/90">
            {/* <Section title="사업자 정보">
              <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-[13px]">
                <Dt>상호</Dt>
                <Dd>[상호명]</Dd>
                <Dt>대표자</Dt>
                <Dd>[대표자명]</Dd>
                <Dt>사업자등록번호</Dt>
                <Dd>[000-00-00000]</Dd>
                <Dt>통신판매업 신고</Dt>
                <Dd>[제0000-지역-0000호]</Dd>
                <Dt>사업장 주소</Dt>
                <Dd>[사업장 주소]</Dd>
                <Dt>고객문의</Dt>
                <Dd>{contact ?? "[문의 이메일]"}</Dd>
              </dl>
              <p className="text-xs text-muted mt-3">
                위 [ ] 항목은 전자상거래법상 표시 의무 정보입니다. 운영자의 실제 등록 정보로
                채워주세요.
              </p>
            </Section> */}

            <Section title="교환 및 환불 안내">
              <ul className="space-y-2 list-disc pl-4">
                <li>
                  상품을 공급받은 날부터 <b>7일 이내</b> 청약철회(반품·환불)가
                  가능합니다 (전자상거래 등에서의 소비자보호에 관한 법률
                  제17조).
                </li>
                <li>
                  단순 변심에 의한 반품의 왕복 배송비는 구매자 부담이며, 상품의
                  하자·오배송의 경우 배송비를 포함해 판매자가 부담하고 전액 환불
                  또는 교환해 드립니다.
                </li>
                <li>
                  다음의 경우 청약철회가 제한될 수 있습니다(사전 고지된 경우): ①
                  1 of 1·커스텀 등 주문에 따라 개별 제작되는 상품, ②
                  착용·세탁·사용으로 상품 가치가 현저히 감소한 경우, ③ 포장을
                  훼손한 경우.
                </li>
                <li>
                  결제는 무통장입금으로, 반품 상품 확인 후 입금하신 계좌로{" "}
                  <b>영업일 기준 3~5일</b> 이내 환불됩니다. 입금 전이라면 문의를
                  통해 즉시 취소할 수 있습니다.
                </li>
              </ul>
            </Section>

            <Section title="개인정보처리방침">
              <ul className="space-y-2 list-disc pl-4">
                <li>
                  <b>수집 항목</b>: 이름, 연락처, 이메일, 배송지 주소, 입금자명
                  (재입고·구독 신청 시 이메일).
                </li>
                <li>
                  <b>이용 목적</b>: 주문 접수·처리, 배송, 입금 확인, 문의 응대,
                  (동의 시) 재입고·신상품 알림.
                </li>
                <li>
                  <b>보유 기간</b>: 관련 법령에 따라 보존(계약·청약철회 기록
                  5년, 대금결제·재화공급 기록 5년, 소비자 불만·분쟁처리 기록
                  3년) 후 지체 없이 파기합니다. 구독 정보는 수신거부 시
                  파기합니다.
                </li>
                <li>
                  <b>제3자 제공·위탁</b>: 원칙적으로 제3자에게 제공하지 않으며,
                  배송을 위해 택배사 등에 배송에 필요한 최소한의 정보만 위탁할
                  수 있습니다.
                </li>
                <li>
                  <b>이용자 권리</b>: 본인의 개인정보 열람·정정·삭제·처리정지를
                  아래 문의 이메일로 요청할 수 있습니다.
                </li>
              </ul>
            </Section>

            <Section title="문의">
              <p>
                상품·주문·교환/환불 및 개인정보 관련 문의는 아래 이메일 또는
                주문조회의 <span className="text-chrome">관리자에게 문의</span>{" "}
                기능을 이용해주세요.
              </p>
              {contact ? (
                <a
                  href={`mailto:${contact}`}
                  className="inline-block mt-2 text-chrome underline"
                >
                  {contact}
                </a>
              ) : (
                <p className="text-xs text-muted mt-2">
                  문의 이메일은 어드민 → 설정에서 등록할 수 있습니다.
                </p>
              )}
            </Section>

            <p className="text-[11px] text-muted border-t border-line pt-5">
              본 안내는 국내 전자상거래 관련 법령을 바탕으로 작성한 일반
              템플릿입니다. 실제 사업자 정보·약관은 운영자가 검토·보완해야 하며,
              법적 효력에 대한 최종 확인은 전문가 자문을 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="chrome-text text-lg mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Dt({ children }: { children: React.ReactNode }) {
  return <dt className="text-muted">{children}</dt>;
}
function Dd({ children }: { children: React.ReactNode }) {
  return <dd className="text-ink/90">{children}</dd>;
}
