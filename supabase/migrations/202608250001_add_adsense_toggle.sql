update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{adsenseEnabled}',
  'true'::jsonb,
  true
)
where id = true
  and not (coalesce(settings, '{}'::jsonb) ? 'adsenseEnabled');
