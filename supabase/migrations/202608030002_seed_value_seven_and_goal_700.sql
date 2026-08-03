update public.site_settings
set settings =
  coalesce(settings, '{}'::jsonb)
  || jsonb_build_object(
    'seedGoal', 700,
    'seedPrice', 7,
    'startingSeeds', 0,
    'meterCurrentAmount',
      mod(
        greatest(
          coalesce(
            nullif(settings->>'meterCurrentAmount', '')::numeric,
            nullif(settings->>'startingSeeds', '')::numeric,
            0
          ),
          0
        ),
        700
      ),
    'amountOptions', jsonb_build_array(7, 11, 33, 77, 111, 333, 777, 999),
    'meterExpanded',
      'Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. This is your sacred step toward the soulmate your heart whispers for.'
      || chr(10) || chr(10)
      || 'Every seed you sow is a seed of intention. 🌱 1 seed ($7) – I''m ready. 🌱🌱🌱 3 seeds ($21) – Mind, body, soulmate aligned. 🌱🌱🌱🌱🌱🌱🌱 7 seeds ($49) – Protection over reunion. 🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱 11 seeds ($77) – Eternal love. ༺💗༻ Click Donate to sow your seed now. Whisper to the universe: “Bring my soulmate to me.” The field is open. 🌱💫🌹',
    'supportTitle', 'Buy a Seed to Sow for the Love You’ve Been Waiting For💕💕 for Sow Your Seed Here for Your Soulmate 💫'
  )
where id = true;

update public.donations
set seed_count = greatest(1, round(amount / 7.0)::integer)
where amount > 0;

update public.seed_comments
set seed_count = greatest(1, round(amount / 7.0)::integer)
where amount is not null
  and amount > 0;
