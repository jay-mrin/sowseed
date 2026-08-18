update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'offeringMode', 'writing'
)
where id = true
  and not (coalesce(settings, '{}'::jsonb) ? 'offeringMode');
