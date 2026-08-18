alter table public.payment_attempts
  add column if not exists supporter_message text,
  add column if not exists expires_at timestamptz;

update public.payment_attempts
set expires_at = coalesce(created_at, now()) + interval '24 hours'
where expires_at is null;

alter table public.payment_attempts
  alter column expires_at set default (now() + interval '24 hours'),
  alter column expires_at set not null;

create index if not exists payment_attempts_status_expires_at_idx
  on public.payment_attempts (status, expires_at);

create unique index if not exists payment_attempts_paypal_capture_id_uidx
  on public.payment_attempts (paypal_capture_id)
  where paypal_capture_id is not null;

-- All privileged settings and order operations go through role-aware Edge
-- Functions using the service role. Remove older direct-table policies that
-- allowed an Admin JWT to bypass Admin/SuperAdmin route isolation.
drop policy if exists "Admins can manage settings" on public.site_settings;
drop policy if exists "Admins can read digital orders" on public.digital_orders;
drop policy if exists "Admins can update digital orders" on public.digital_orders;
drop policy if exists "Admins can read checkout events" on public.checkout_events;

create table if not exists public.meter_applied_donations (
  donation_id uuid primary key references public.donations(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.meter_applied_donations enable row level security;

-- Existing completed Admin-route payments have already contributed to the
-- live meter. Mark them as applied without changing the current meter value so
-- a later duplicate capture/webhook cannot count them a second time.
insert into public.meter_applied_donations (donation_id, amount, created_at)
select id, amount, created_at
from public.donations
where paypal_status = 'COMPLETED'
  and payment_route = 'standard'
  and visibility_scope = 'public'
  and payment_method = 'paypal'
on conflict (donation_id) do nothing;

create or replace function public.apply_standard_donation_to_meter(
  p_donation_id uuid,
  p_amount numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb;
  v_goal numeric;
  v_current numeric;
  v_next numeric;
  v_inserted uuid;
begin
  if p_donation_id is null or p_amount is null or p_amount <= 0 then
    raise exception 'A valid donation id and positive amount are required.';
  end if;

  select settings
  into v_settings
  from public.site_settings
  where id = true
  for update;

  if v_settings is null then
    raise exception 'Site settings are missing.';
  end if;

  insert into public.meter_applied_donations (donation_id, amount)
  values (p_donation_id, p_amount)
  on conflict (donation_id) do nothing
  returning donation_id into v_inserted;

  v_goal := greatest(coalesce(nullif(v_settings->>'seedGoal', '')::numeric, 0), 0);
  v_current := greatest(
    coalesce(
      nullif(v_settings->>'meterCurrentAmount', '')::numeric,
      nullif(v_settings->>'startingSeeds', '')::numeric,
      0
    ),
    0
  );

  if v_inserted is not null then
    v_next := case
      when v_goal > 0 then mod(v_current + p_amount, v_goal)
      else v_current + p_amount
    end;

    update public.site_settings
    set settings = jsonb_set(v_settings, '{meterCurrentAmount}', to_jsonb(v_next), true)
    where id = true;
  else
    v_next := case when v_goal > 0 then mod(v_current, v_goal) else v_current end;
  end if;

  return v_next;
end;
$$;

revoke all on function public.apply_standard_donation_to_meter(uuid, numeric) from public, anon, authenticated;
grant execute on function public.apply_standard_donation_to_meter(uuid, numeric) to service_role;
