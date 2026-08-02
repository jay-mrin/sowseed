alter table public.admin_profiles
  add column if not exists role text not null default 'admin';

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('admin', 'super_admin'));

alter table public.donations
  add column if not exists payment_route text not null default 'standard',
  add column if not exists receiver_identifier text;

alter table public.donations
  drop constraint if exists donations_payment_route_check;

alter table public.donations
  add constraint donations_payment_route_check
  check (payment_route in ('standard', 'large'));

create index if not exists donations_payment_route_created_at_idx
on public.donations (payment_route, created_at desc);

update public.admin_profiles
set role = 'super_admin'
where lower(email) = 'jaymrin01@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'super_admin'
  );
$$;

create or replace function public.is_admin_or_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;
