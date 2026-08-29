-- Add role-routed weekly PayPal subscriptions without removing the dormant
-- monthly membership schema that may already exist in deployed databases.

-- A previous cleanup removed the unused monthly membership tables. Recreate
-- them when necessary so this migration works on both database histories.
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  payment_route text not null check (payment_route in ('standard', 'superadmin')),
  currency text not null,
  amount numeric(12, 2) not null check (amount > 0),
  paypal_product_id text not null,
  paypal_plan_id text not null unique,
  interval_unit text not null default 'WEEK',
  interval_count integer not null default 1,
  setup_fee_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
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
  paypal_payer_id text,
  status text not null default 'pending',
  frequency text not null default 'weekly',
  seed_count integer not null check (seed_count > 0),
  billing_anchor_at timestamptz,
  next_billing_at timestamptz,
  next_retry_at timestamptz,
  last_failed_at timestamptz,
  successful_payment_count integer not null default 0 check (successful_payment_count >= 0),
  last_successful_payment_at timestamptz,
  cancelled_at timestamptz,
  payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  customer_request text,
  personalized_request text,
  raw_subscription jsonb not null default '{}'::jsonb,
  opted_in_at timestamptz not null default now(),
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
  payment_kind text not null default 'renewal',
  donation_id uuid references public.donations(id) on delete set null,
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
  payment_route text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.membership_plans
  add column if not exists interval_unit text,
  add column if not exists interval_count integer,
  add column if not exists setup_fee_amount numeric(12, 2);

update public.membership_plans
set interval_unit = coalesce(interval_unit, 'MONTH'),
    interval_count = coalesce(interval_count, 1),
    setup_fee_amount = coalesce(setup_fee_amount, 0);

alter table public.membership_plans
  alter column interval_unit set default 'WEEK',
  alter column interval_unit set not null,
  alter column interval_count set default 1,
  alter column interval_count set not null,
  alter column setup_fee_amount set default 0,
  alter column setup_fee_amount set not null;

alter table public.membership_plans
  drop constraint if exists membership_plans_interval_unit_check,
  add constraint membership_plans_interval_unit_check
    check (interval_unit in ('WEEK', 'MONTH')),
  drop constraint if exists membership_plans_interval_count_check,
  add constraint membership_plans_interval_count_check check (interval_count > 0),
  drop constraint if exists membership_plans_setup_fee_amount_check,
  add constraint membership_plans_setup_fee_amount_check check (setup_fee_amount >= 0);

alter table public.membership_plans
  drop constraint if exists membership_plans_payment_route_currency_amount_key;

create unique index if not exists membership_plans_route_amount_interval_uidx
  on public.membership_plans (
    payment_route,
    currency,
    amount,
    interval_unit,
    interval_count,
    setup_fee_amount
  );

alter table public.memberships
  add column if not exists frequency text,
  add column if not exists seed_count integer,
  add column if not exists billing_anchor_at timestamptz,
  add column if not exists next_retry_at timestamptz,
  add column if not exists last_failed_at timestamptz,
  add column if not exists paypal_payer_id text,
  add column if not exists payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  add column if not exists customer_request text,
  add column if not exists personalized_request text;

update public.memberships
set frequency = coalesce(frequency, 'monthly'),
    seed_count = coalesce(seed_count, greatest(round(amount / 7), 1)::integer);

alter table public.memberships
  alter column frequency set default 'weekly',
  alter column frequency set not null,
  alter column seed_count set not null;

alter table public.memberships
  drop constraint if exists memberships_frequency_check,
  add constraint memberships_frequency_check
    check (frequency in ('monthly', 'weekly')),
  drop constraint if exists memberships_seed_count_check,
  add constraint memberships_seed_count_check check (seed_count > 0),
  drop constraint if exists memberships_status_check,
  add constraint memberships_status_check
    check (status in ('pending', 'active', 'past_due', 'suspended', 'cancelled', 'expired'));

alter table public.membership_payments
  add column if not exists payment_kind text not null default 'renewal',
  add column if not exists donation_id uuid references public.donations(id) on delete set null;

alter table public.membership_payments
  drop constraint if exists membership_payments_payment_kind_check,
  add constraint membership_payments_payment_kind_check
    check (payment_kind in ('initial', 'renewal', 'retry'));

alter table public.donations
  drop constraint if exists donations_frequency_check,
  add constraint donations_frequency_check
    check (frequency in ('once', 'monthly', 'weekly')),
  add column if not exists membership_id uuid references public.memberships(id) on delete set null,
  add column if not exists provider_transaction_id text;

create unique index if not exists donations_provider_transaction_id_uidx
  on public.donations (provider_transaction_id)
  where provider_transaction_id is not null;

alter table public.payment_attempts
  drop constraint if exists payment_attempts_frequency_check,
  add constraint payment_attempts_frequency_check
    check (frequency in ('once', 'monthly', 'weekly'));

alter table public.membership_webhook_events
  add column if not exists payment_route text,
  add column if not exists processed_at timestamptz;

alter table public.membership_webhook_events
  drop constraint if exists membership_webhook_events_payment_route_check,
  add constraint membership_webhook_events_payment_route_check
    check (payment_route is null or payment_route in ('standard', 'superadmin'));

create index if not exists memberships_route_status_next_idx
  on public.memberships (payment_route, status, next_billing_at);
create index if not exists memberships_paypal_subscription_idx
  on public.memberships (paypal_subscription_id);
create index if not exists membership_payments_donation_idx
  on public.membership_payments (donation_id);
create index if not exists memberships_payment_attempt_id_idx
  on public.memberships (payment_attempt_id);

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
  update public.memberships
  set successful_payment_count = (
        select count(*)::integer
        from public.membership_payments
        where membership_id = target_membership_id and upper(status) = 'COMPLETED'
      ),
      last_successful_payment_at = (
        select max(paid_at)
        from public.membership_payments
        where membership_id = target_membership_id and upper(status) = 'COMPLETED'
      ),
      updated_at = now()
  where id = target_membership_id;
end;
$$;

revoke all on function public.refresh_membership_payment_summary(uuid) from public, anon, authenticated;
grant execute on function public.refresh_membership_payment_summary(uuid) to service_role;

-- Record the donation, writing order, payment ledger, and public-meter entry in
-- one database transaction. Replayed or concurrent webhooks return the same
-- donation instead of producing a second order.
create or replace function public.record_weekly_subscription_payment(
  p_membership_id uuid,
  p_transaction_id text,
  p_amount numeric,
  p_currency text,
  p_paid_at timestamptz,
  p_fortune_id bigint,
  p_fortune_message text,
  p_order_number text,
  p_raw_payment jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.memberships%rowtype;
  v_donation_id uuid;
  v_payment_kind text;
begin
  if nullif(trim(p_transaction_id), '') is null or p_amount <= 0 then
    raise exception 'A transaction id and positive amount are required.';
  end if;

  select * into v_membership
  from public.memberships
  where id = p_membership_id and frequency = 'weekly'
  for update;

  if not found then
    raise exception 'Weekly membership was not found.';
  end if;

  select id into v_donation_id
  from public.donations
  where provider_transaction_id = p_transaction_id;

  if v_donation_id is null then
    insert into public.donations (
      display_name,
      amount,
      seed_count,
      frequency,
      supporter_message,
      payment_method,
      paypal_payer_email,
      paypal_status,
      payment_route,
      visibility_scope,
      fortune_id,
      fortune_message,
      membership_id,
      provider_transaction_id,
      raw_payment,
      created_at
    ) values (
      v_membership.customer_name,
      p_amount,
      v_membership.seed_count,
      'weekly',
      v_membership.customer_request,
      'paypal',
      v_membership.customer_email,
      'COMPLETED',
      v_membership.payment_route,
      case when v_membership.payment_route = 'superadmin' then 'superadmin_private' else 'public' end,
      p_fortune_id,
      p_fortune_message,
      v_membership.id,
      p_transaction_id,
      coalesce(p_raw_payment, '{}'::jsonb),
      coalesce(p_paid_at, now())
    )
    returning id into v_donation_id;
  elsif not exists (
    select 1 from public.donations
    where id = v_donation_id and membership_id = v_membership.id
  ) then
    raise exception 'Subscription transaction belongs to another membership.';
  end if;

  insert into public.digital_orders (
    order_number,
    donation_id,
    customer_name,
    contact_email,
    payer_email,
    amount,
    currency,
    item_name,
    personalized_request,
    blessing_message,
    fulfillment_status,
    created_at
  ) values (
    p_order_number,
    v_donation_id,
    v_membership.customer_name,
    v_membership.customer_email,
    v_membership.customer_email,
    p_amount,
    upper(p_currency),
    'Personalised Digital Writing - Custom Order Made Writing',
    coalesce(v_membership.personalized_request, v_membership.customer_request),
    p_fortune_message,
    'paid_awaiting_personalized_writing',
    coalesce(p_paid_at, now())
  )
  on conflict (donation_id) do nothing;

  v_payment_kind := case
    when v_membership.successful_payment_count = 0 then 'initial'
    when v_membership.status in ('past_due', 'suspended') then 'retry'
    else 'renewal'
  end;

  insert into public.membership_payments (
    membership_id,
    paypal_transaction_id,
    amount,
    currency,
    status,
    payment_kind,
    donation_id,
    paid_at,
    raw_payment
  ) values (
    v_membership.id,
    p_transaction_id,
    p_amount,
    upper(p_currency),
    'COMPLETED',
    v_payment_kind,
    v_donation_id,
    coalesce(p_paid_at, now()),
    coalesce(p_raw_payment, '{}'::jsonb)
  )
  on conflict (paypal_transaction_id) do nothing;

  if v_membership.payment_route = 'standard' then
    perform public.apply_standard_donation_to_meter(v_donation_id, p_amount);
  end if;

  perform public.refresh_membership_payment_summary(v_membership.id);
  return v_donation_id;
end;
$$;

revoke all on function public.record_weekly_subscription_payment(uuid, text, numeric, text, timestamptz, bigint, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_weekly_subscription_payment(uuid, text, numeric, text, timestamptz, bigint, text, text, jsonb) to service_role;

drop trigger if exists touch_memberships_updated_at on public.memberships;
create trigger touch_memberships_updated_at
before update on public.memberships
for each row execute function public.touch_updated_at();
