export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HVVN-${yy}${mm}${dd}-${rand}`;
}

const JEJU_DOSEO_PREFIXES = ["63"]; // 제주 우편번호 시작 — 도서산간은 운영자가 보완
export function isRemoteArea(postcode: string): boolean {
  return JEJU_DOSEO_PREFIXES.some((p) => postcode.startsWith(p));
}
