import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase, adminProfile } = await requireAdmin(request, { allowedRoles: ["admin", "super_admin"] });

    if (request.method === "GET") {
      const { data, error } = await supabase.from("site_settings").select("settings").eq("id", true).single();
      if (error) throw error;
      return jsonResponse({ settings: data.settings });
    }

    if (request.method !== "POST" && request.method !== "PUT") {
      return errorResponse("Method not allowed.", 405);
    }

    const body = await readJson<{ settings?: Record<string, unknown> }>(request);
    if (!body.settings || typeof body.settings !== "object") {
      return errorResponse("Settings payload is required.", 422);
    }

    const { data: current, error: currentError } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", true)
      .maybeSingle();
    if (currentError) throw currentError;

    const currentSettings = (current?.settings && typeof current.settings === "object"
      ? current.settings
      : {}) as Record<string, unknown>;
    let settingsToSave = body.settings;

    if (adminProfile.role === "super_admin") {
      const checkoutRoute = body.settings.checkoutRoute === "superadmin" ? "superadmin" : "standard";
      const razorpayEnabled = body.settings.razorpayEnabled !== false && body.settings.razorpayEnabled !== "false";
      const paypalEnabled = body.settings.paypalEnabled !== false && body.settings.paypalEnabled !== "false";
      const wiseEnabled = body.settings.wiseEnabled !== false && body.settings.wiseEnabled !== "false";
      settingsToSave = {
        ...currentSettings,
        checkoutRoute,
        razorpayEnabled,
        paypalEnabled,
        wiseEnabled,
      };
    } else {
      settingsToSave = {
        ...body.settings,
        checkoutRoute: currentSettings.checkoutRoute === "superadmin" ? "superadmin" : "standard",
        razorpayEnabled: currentSettings.razorpayEnabled !== false && currentSettings.razorpayEnabled !== "false",
        paypalEnabled: currentSettings.paypalEnabled !== false && currentSettings.paypalEnabled !== "false",
        wiseEnabled: currentSettings.wiseEnabled !== false && currentSettings.wiseEnabled !== "false",
      };
    }

    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ id: true, settings: settingsToSave }, { onConflict: "id" })
      .select("settings")
      .single();

    if (error) throw error;
    return jsonResponse({ settings: data.settings });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not save admin settings.", 500, String(error));
  }
});
