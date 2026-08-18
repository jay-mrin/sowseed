update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'supportTitle',
  'Choose a Seed Writing from the Seed Garden 🌱💗'
)
where id = true;
