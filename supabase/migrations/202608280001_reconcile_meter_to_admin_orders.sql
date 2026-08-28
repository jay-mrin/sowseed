-- Keep the public meter derived from the idempotent Admin-payment ledger.
-- This also repairs the historic difference left when the ledger was
-- backfilled without recalculating the stored meter amount.
create or replace function public.reconcile_standard_meter()
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb;
  v_goal numeric;
  v_total numeric;
  v_next numeric;
begin
  select settings
  into v_settings
  from public.site_settings
  where id = true
  for update;

  if v_settings is null then
    raise exception 'Site settings are missing.';
  end if;

  select coalesce(sum(amount), 0)
  into v_total
  from public.meter_applied_donations;

  v_goal := greatest(
    coalesce(nullif(v_settings->>'seedGoal', '')::numeric, 0),
    0
  );
  v_next := case when v_goal > 0 then mod(v_total, v_goal) else v_total end;

  update public.site_settings
  set settings = jsonb_set(
    v_settings,
    '{meterCurrentAmount}',
    to_jsonb(v_next),
    true
  )
  where id = true;

  return v_next;
end;
$$;

revoke all on function public.reconcile_standard_meter() from public, anon, authenticated;
grant execute on function public.reconcile_standard_meter() to service_role;

create or replace function public.apply_standard_donation_to_meter(
  p_donation_id uuid,
  p_amount numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_donation_id is null or p_amount is null or p_amount <= 0 then
    raise exception 'A valid donation id and positive amount are required.';
  end if;

  insert into public.meter_applied_donations (donation_id, amount)
  values (p_donation_id, p_amount)
  on conflict (donation_id) do nothing;

  return public.reconcile_standard_meter();
end;
$$;

revoke all on function public.apply_standard_donation_to_meter(uuid, numeric) from public, anon, authenticated;
grant execute on function public.apply_standard_donation_to_meter(uuid, numeric) to service_role;

create or replace function public.reconcile_standard_meter_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.reconcile_standard_meter();
  return null;
end;
$$;

revoke all on function public.reconcile_standard_meter_after_delete() from public, anon, authenticated;

drop trigger if exists reconcile_standard_meter_after_ledger_delete
  on public.meter_applied_donations;
create trigger reconcile_standard_meter_after_ledger_delete
after delete on public.meter_applied_donations
for each statement execute function public.reconcile_standard_meter_after_delete();

select public.reconcile_standard_meter();
