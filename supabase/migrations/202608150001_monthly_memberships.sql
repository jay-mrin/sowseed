create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  payment_route text not null check (payment_route in ('standard', 'superadmin')),
  currency text not null,
  amount numeric(12, 2) not null check (amount > 0),
  paypal_product_id text not null,
  paypal_plan_id text not null unique,
  created_at timestamptz not null default now(),
  unique (payment_route, currency, amount)
);
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  checkout_token uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  customer_email text not null,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null,
  payment_route text not null check (payment_route in ('standard', 'superadmin')),
  paypal_plan_id text not null,
  paypal_subscription_id text unique,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  opted_in_at timestamptz not null default now(),
  next_billing_at timestamptz,
  successful_payment_count integer not null default 0 check (successful_payment_count >= 0),
  last_successful_payment_at timestamptz,
  cancelled_at timestamptz,
  raw_subscription jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.memberships(id) on delete cascade,
  paypal_transaction_id text not null unique,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null,
  status text not null,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  paid_at timestamptz,
  raw_payment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.membership_webhook_events (
  event_id text primary key,
  paypal_subscription_id text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists memberships_route_opted_idx on public.memberships (payment_route, opted_in_at desc);
create index if not exists memberships_status_next_billing_idx on public.memberships (status, next_billing_at);
create index if not exists membership_payments_membership_paid_idx on public.membership_payments (membership_id, paid_at desc);
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_payments enable row level security;
alter table public.membership_webhook_events enable row level security;
create or replace function public.refresh_membership_payment_summary(target_membership_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update memberships
  set successful_payment_count = (
        select count(*)::integer from membership_payments
        where membership_id = target_membership_id and upper(status) = 'COMPLETED'
      ),
      last_successful_payment_at = (
        select max(paid_at) from membership_payments
        where membership_id = target_membership_id and upper(status) = 'COMPLETED'
      ),
      updated_at = now()
  where id = target_membership_id;
end;
$$;
revoke all on function public.refresh_membership_payment_summary(uuid) from public;
grant execute on function public.refresh_membership_payment_summary(uuid) to service_role;
