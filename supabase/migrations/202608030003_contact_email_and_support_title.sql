alter table public.digital_orders
add column if not exists contact_email text;

update public.digital_orders
set contact_email = coalesce(contact_email, payer_email)
where contact_email is null;

update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{supportTitle}',
  to_jsonb('Buy a Seed to Sow for the Love You’ve Been Waiting For in 💕Christ Pradise garden💫'::text),
  true
)
where id = true;
