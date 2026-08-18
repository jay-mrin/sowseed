update public.site_settings
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{followersText}',
  '"5,346 Followers"'::jsonb,
  true
)
where id = true;
