update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{largeDonationRoutingEnabled}',
  'true'::jsonb,
  true
)
where id = true
  and not (coalesce(settings, '{}'::jsonb) ? 'largeDonationRoutingEnabled');
