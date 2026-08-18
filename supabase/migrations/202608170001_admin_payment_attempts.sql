create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  contact_email text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'USD',
  customer_request text,
  frequency text not null default 'once' check (frequency in ('once', 'monthly')),
  product_type text,
  product_id text,
  payment_route text not null default 'standard' check (payment_route in ('standard', 'superadmin')),
  status text not null default 'started' check (status in ('started', 'confirmed', 'failed')),
  paypal_order_id text unique,
  paypal_capture_id text,
  failure_reason text,
  raw_payment jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payment_attempts_route_created_at_idx
on public.payment_attempts (payment_route, created_at desc);
create index if not exists payment_attempts_status_created_at_idx
on public.payment_attempts (status, created_at desc);
drop trigger if exists touch_payment_attempts_updated_at on public.payment_attempts;
create trigger touch_payment_attempts_updated_at
before update on public.payment_attempts
for each row execute function public.touch_updated_at();
alter table public.payment_attempts enable row level security;
drop policy if exists "Admins can read Admin payment attempts" on public.payment_attempts;
create policy "Admins can read Admin payment attempts"
on public.payment_attempts for select
using (public.is_admin() and payment_route = 'standard');
alter table public.memberships
  add column if not exists payment_attempt_id uuid references public.payment_attempts(id) on delete set null;
create index if not exists memberships_payment_attempt_id_idx
on public.memberships (payment_attempt_id);
update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{amountOptions}',
  '[7, 21, 49, 77, 147, 231]'::jsonb,
  true
)
where id = true;
