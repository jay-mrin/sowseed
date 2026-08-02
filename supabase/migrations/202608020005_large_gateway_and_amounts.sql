update public.site_settings
set settings = jsonb_set(
  settings,
  '{amountOptions}',
  '[6, 11, 33, 99, 111, 333, 666, 999]'::jsonb,
  true
)
where id = true;
