# HVVN Store

아티스트 hvvn 굿즈 판매를 위한 인디/미니멀 무드의 이커머스 플랫폼.
hvvn_page(바이브 코딩 prototype)를 **예측 가능한 아키텍처**로 재작성한 프로젝트입니다.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** — 솔리드 블랙 + 크롬(Y2K metal gothic) 디자인 시스템
- **Supabase** (Postgres + Auth + Storage, RLS)
- **TanStack Query** (server state) + **Zustand** (global UI state)
- **Resend** (트랜잭션 + 구독 메일 발송)
- **Vercel** 배포

## 디렉토리 구조

```text
src/
  app/             # Next.js 16 App Router (라우팅 표면)
    (shop)/        # 스토어프론트 (/, /products, /cart, /checkout, /orders)
    (admin)/       # 관리자 (/admin/*)
    api/           # Route Handlers (orders, inquiries, waitlist, subscribe, webhooks)
    layout.tsx     # 루트 레이아웃
    globals.css
  components/
    ui/            # 순수 디자인 primitive (button, input …)
    features/      # 도메인 컴포넌트 (ProductCard, CartList …)
    layouts/       # GNB / Footer / Sidebar
    providers/     # QueryProvider 등
  hooks/           # 비즈니스 로직 (Shell-Hook-Content)
  lib/
    supabase/      # client / server / service 클라이언트
    integrations/  # Google OAuth, Resend 등 외부 연동
    validation/    # zod 스키마 (클라/서버 공유)
    utils.ts       # cn() 등
  store/           # Zustand 스토어 (cart 등)
  types/           # 도메인/DB 타입
  middleware.ts    # 세션 유지 + /admin 가드
db/                # schema.sql, seed.sql
```

> 라우팅까지 `src/` 아래로 통일(`src/app`). 가이드 다이어그램은 루트 `app/`을 보여주지만,
> 실제 코드는 모든 소스를 `src/`로 모으는 `src/app/` 레이아웃을 채택했습니다.

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # 값 채우기 (아래 참고)
pnpm dev
```

### 환경 변수 (.env.local)

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 (절대 클라이언트 노출 금지) |
| `NEXT_PUBLIC_SITE_URL` | 메일 링크/콜백용 공개 도메인 |
| `RESEND_API_KEY` / `RESEND_FROM` | 메일 발송 (인증된 도메인 발신 주소) |
| `GOOGLE_*` | Google OAuth (선택) |

### Supabase 설정

1. 새 프로젝트 생성 → SQL Editor 에서 `db/schema.sql` 실행 (테이블 · RLS · `product-images`/`site-assets` 버킷 생성).
2. `db/seed.sql` 로 샘플 상품 등록 (선택).
3. Authentication → Users 에서 관리자 계정 추가.

## 가드레일

- UI 컴포넌트 내 직접 `fetch`/`axios` 금지 → `src/lib` 또는 TanStack Query 훅 경유.
- `any` 금지. 작업 후 `pnpm typecheck` (`tsc --noEmit`) 에러 0.
- 인증/RLS/스토리지 로직 훼손 금지.

## 진행 상황

- [x] **M1** 기반 스캐폴드 (구조 · 디자인 시스템 · DB 스키마 · lib/타입 · 빌드 검증)
- [x] **M2** 스토어프론트 이식 (홈·상품·카트·체크아웃·주문조회 + API · 헤더 sticky 수정 · 카트 remove 재배치)
- [x] **M3** 이슈 수정 (주문 zod 검증 강화 · 문의 무한요청 차단: 쿨다운/일일한도/중복차단)
- [x] **M6** YZY 스타일 커머스 드로어 (카트·주문자정보·완료·주문조회 통합, /cart·/checkout·/orders 리다이렉트)
- [x] **M7** `products/[id]` 라우팅 전환
- [x] **M5** 관리자 영역 — 로그인·대시보드·상품 CRUD(메인+상세 이미지 업로드)·주문 상태관리·문의·구독자·설정
- [x] **M4** 메일링/구독 — 구독 캡처(바텀시트) + **Resend 발송**(주문확인·배송 알림·재입고 알림) + email_log 감사로그

전체 마일스톤 완료. 메일 발송은 `.env.local`에 `RESEND_API_KEY` + `RESEND_FROM`(인증 도메인 발신주소) 설정 시 동작 (미설정 시 주문/배송 흐름은 정상, 메일만 skip 후 email_log에 기록).
