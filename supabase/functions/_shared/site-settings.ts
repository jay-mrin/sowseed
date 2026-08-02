const LARGE_DONATION_ROUTING_KEY = "largeDonationRoutingEnabled";

export function normalizeLargeDonationRoutingEnabled(settings: Record<string, unknown> | null | undefined) {
  if (!settings || typeof settings !== "object" || !(LARGE_DONATION_ROUTING_KEY in settings)) return true;

  const value = settings[LARGE_DONATION_ROUTING_KEY];

  return value !== false && value !== "false";
}

export async function readSiteSettings(supabase: any) {
  const { data, error } = await supabase.from("site_settings").select("settings").eq("id", true).maybeSingle();

  if (error) throw error;

  const settings = data?.settings;

  return settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {};
}

export async function isLargeDonationRoutingEnabled(supabase: any) {
  const settings = await readSiteSettings(supabase);

  return normalizeLargeDonationRoutingEnabled(settings);
}

export async function updateLargeDonationRoutingEnabled(supabase: any, enabled: boolean) {
  const settings = await readSiteSettings(supabase);
  const nextSettings = {
    ...settings,
    [LARGE_DONATION_ROUTING_KEY]: Boolean(enabled),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ id: true, settings: nextSettings }, { onConflict: "id" })
    .select("settings")
    .single();

  if (error) throw error;

  const savedSettings =
    data?.settings && typeof data.settings === "object" && !Array.isArray(data.settings) ? data.settings : nextSettings;

  return {
    settings: savedSettings,
    largeDonationRoutingEnabled: normalizeLargeDonationRoutingEnabled(savedSettings),
  };
}
