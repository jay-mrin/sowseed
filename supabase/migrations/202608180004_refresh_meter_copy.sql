update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'meterHeadline', 'Sow Your Seed 🌱with faith💫 trust🌹 and patience ༺💗༻',
  'meterCollapsed', 'Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. Make an order',
  'meterExpanded', 'Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. Make an order'
    || chr(10) || chr(10)
    || 'With every seed you sow you get a personalised mail of your request, prepared with care and intention. 🌱💫🌹'
)
where id = true;
