-- =====================================================
-- HVVN store schema (Supabase / PostgreSQL)
-- Run this in the Supabase SQL editor on a fresh project.
-- =====================================================

create extension if not exists "pgcrypto";

-- ---------- Settings (singleton row id=1) ----------
create table if not exists public.settings (
  id integer primary key default 1,
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  shipping_fee_default integer not null default 4000,
  shipping_fee_remote integer not null default 7000,
  about_html text,
  instagram_url text,
  contact_email text,
  bg_youtube_url text, -- optional: background music video (admin-configurable)
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
insert into public.settings (id) values (1) on conflict do nothing;
-- For existing DBs:
alter table public.settings add column if not exists bg_youtube_url text;

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_krw integer not null check (price_krw >= 0),
  short_description text,
  description_html text,
  stock integer not null default 0 check (stock >= 0),
  is_published boolean not null default true,
  is_set boolean not null default false,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_published_idx on public.products (is_published, created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

create table if not exists public.product_set_items (
  set_id uuid not null references public.products(id) on delete cascade,
  member_id uuid not null references public.products(id) on delete restrict,
  position integer not null default 0,
  primary key (set_id, member_id)
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_postcode text not null,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_memo text,
  subtotal_krw integer not null,
  shipping_fee_krw integer not null,
  total_krw integer not null,
  is_remote_area boolean not null default false,
  depositor_name text not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','shipping','delivered','cancelled')),
  payment_method text not null default 'bank_transfer',
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists orders_lookup_idx on public.orders (customer_name, customer_phone);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  unit_price_krw integer not null,
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------- Waitlist (사고 싶어요 / 재입고 알림) ----------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (product_id, email)
);

-- ---------- Inquiries (관리자 문의) ----------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  message text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);
-- 무한 문의 방지: 동일 주문/이메일의 최근 문의를 빠르게 조회하기 위한 인덱스 (rate-limit 은 API 레이어에서 강제)
create index if not exists inquiries_order_created_idx on public.inquiries (order_id, created_at desc);
create index if not exists inquiries_email_created_idx on public.inquiries (customer_email, created_at desc);

-- ---------- Email subscribers (구독 서비스) ----------
create table if not exists public.email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,                       -- 'checkout' | 'footer' | 'manual' 등 유입 경로
  is_active boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unique (email)
);
create unique index if not exists email_subscribers_token_idx
  on public.email_subscribers (unsubscribe_token);
create index if not exists email_subscribers_active_idx
  on public.email_subscribers (is_active, created_at desc);

-- ---------- Email log (발송 감사 로그 / 중복 발송 방지) ----------
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,            -- 'order_confirmation' | 'shipping' | 'restock' | 'broadcast'
  ref_id text,                       -- 관련 주문번호/상품id 등
  provider_id text,                  -- Resend 메시지 id
  status text not null default 'sent' check (status in ('sent','failed')),
  error text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_ref_idx on public.email_log (template, ref_id);

-- ---------- Integrations (Google, Kakao, …) ----------
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  account_email text,
  access_token text,
  refresh_token text,
  scopes text[],
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider)
);

-- =====================================================
-- Row Level Security
--   - Public reads for products (published only) and settings (non-sensitive)
--   - All writes go through service role on the server. Anon cannot touch.
-- =====================================================

alter table public.settings enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_set_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.waitlist enable row level security;
alter table public.inquiries enable row level security;
alter table public.email_subscribers enable row level security;
alter table public.email_log enable row level security;
alter table public.integrations enable row level security;

drop policy if exists "settings: public read non-sensitive" on public.settings;
create policy "settings: public read non-sensitive" on public.settings
  for select using (true);

drop policy if exists "products: public read published" on public.products;
create policy "products: public read published" on public.products
  for select using (is_published);

drop policy if exists "product_images: public read" on public.product_images;
create policy "product_images: public read" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );

drop policy if exists "product_set_items: public read" on public.product_set_items;
create policy "product_set_items: public read" on public.product_set_items
  for select using (
    exists (select 1 from public.products p where p.id = set_id and p.is_published)
  );

-- Orders / inquiries / waitlist / subscribers / email_log / integrations:
-- NO anon policies. Server uses service role for all writes/reads.

-- =====================================================
-- Storage buckets
-- =====================================================
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "site-assets public read" on storage.objects;
create policy "site-assets public read" on storage.objects
  for select using (bucket_id = 'site-assets');
