update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{amountOptions}',
  '[7, 21, 49, 77, 147, 231, 539, 693]'::jsonb,
  true
)
where id = true;
