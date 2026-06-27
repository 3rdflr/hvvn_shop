"use client";

import { useUi } from "@/store/ui";

export function SiteFooter() {
  const openInfo = useUi((s) => s.openInfo);
  const year = new Date().getFullYear();

  return (
    <footer className="container-page py-10 border-t border-line mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] tracking-widest2 uppercase text-muted">
        <button
          type="button"
          onClick={openInfo}
          className="hover:text-chrome transition text-left"
        >
          이용안내 · 환불/교환 · 개인정보처리방침
        </button>
        <span>© {year} hvvn</span>
      </div>
    </footer>
  );
}
