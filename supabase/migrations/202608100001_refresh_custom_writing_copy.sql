update public.site_settings
set settings = jsonb_set(
  jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(settings, '{}'::jsonb),
          '{meterHeadline}',
          to_jsonb('༺💗༻ Click the order button to sow your seed now. With every seed you sow you get a personalised mail of your request. 🌱💫🌹'::text),
          true
        ),
        '{meterCollapsed}',
        to_jsonb('Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. Make an order and receive your personalised writing.'::text),
        true
      ),
      '{meterExpanded}',
      to_jsonb('Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. Make an order and receive your personalised writing.' || chr(10) || chr(10) || 'With every seed you sow you get a personalised mail of your request, prepared with care and intention. 🌱💫🌹'::text),
      true
    ),
    '{aboutCollapsed}',
    to_jsonb('🌱✨ Personalised Digital Writing Made for Your Request ✨🌱' || chr(10) || 'Share your intention and receive a custom writing created with care...'::text),
    true
  ),
  '{aboutExpanded}',
  to_jsonb('🌱✨ Personalised Digital Writing Made for Your Request ✨🌱' || chr(10) || chr(10) || 'Share your prayer, intention, or message and receive a heartfelt custom writing created especially for your order.' || chr(10) || chr(10) || 'Every personalised mail is prepared with care, faith, and thoughtful attention to what you asked for.'::text),
  true
  ),
  '{supportTitle}',
  to_jsonb('Choose Your Seed Offering for Your Soulmate & Loved Ones🌱💗 and get a personalised mail as your digital writing order'::text),
  true
)
where id = true;
