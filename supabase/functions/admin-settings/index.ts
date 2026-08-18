import {
  errorResponse,
  handleOptions,
  jsonResponse,
  readJson,
} from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

const ACTIVE_SETTING_KEYS = [
  "profileTitle",
  "followersText",
  "meterHeadline",
  "meterCollapsed",
  "meterExpanded",
  "aboutTitle",
  "aboutCollapsed",
  "aboutExpanded",
  "topicLabel",
  "supportTitle",
  "postAuthorName",
  "postTitle",
  "postBody",
  "seedGoal",
  "meterCurrentAmount",
  "seedPrice",
  "blessingWallEnabled",
  "checkoutRoute",
  "highPaymentSuperAdminEnabled",
] as const;

function keepActiveSettings(settings: Record<string, unknown>) {
  const activeSettings: Record<string, unknown> = {};

  for (const key of ACTIVE_SETTING_KEYS) {
    if (Object.hasOwn(settings, key)) activeSettings[key] = settings[key];
  }

  return activeSettings;
}

function isEnabled(value: unknown) {
  return value === true || value === "true";
}

function normalizeCheckoutRoute(value: unknown) {
  return value === "superadmin" ? "superadmin" : "standard";
}

function applyGoalSettings(
  existing: Record<string, unknown>,
  submitted: Record<string, unknown>,
) {
  const next = { ...existing };

  if (Object.hasOwn(submitted, "seedGoal")) {
    next.seedGoal = Math.max(
      Number.parseInt(String(submitted.seedGoal), 10) || 1,
      1,
    );
  }
  if (Object.hasOwn(submitted, "meterCurrentAmount")) {
    next.meterCurrentAmount = Math.max(
      Number.parseFloat(String(submitted.meterCurrentAmount)) || 0,
      0,
    );
  }
  if (Object.hasOwn(submitted, "seedPrice")) {
    next.seedPrice = Math.max(
      Number.parseInt(String(submitted.seedPrice), 10) || 7,
      7,
    );
  }
  if (Object.hasOwn(submitted, "blessingWallEnabled")) {
    next.blessingWallEnabled = submitted.blessingWallEnabled !== false &&
      submitted.blessingWallEnabled !== "false";
  }

  return next;
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase, adminProfile } = await requireAdmin(request, {
      allowedRoles: ["admin", "super_admin"],
    });

    if (request.method === "GET") {
      const { data, error } = await supabase.from("site_settings").select(
        "settings",
      ).eq("id", true).single();
      if (error) throw error;
      return jsonResponse({
        settings: keepActiveSettings(data.settings as Record<string, unknown>),
      });
    }

    if (request.method !== "POST" && request.method !== "PUT") {
      return errorResponse("Method not allowed.", 405);
    }

    const body = await readJson<{ settings?: Record<string, unknown> }>(
      request,
    );
    if (!body.settings || typeof body.settings !== "object") {
      return errorResponse("Settings payload is required.", 422);
    }

    const { data: current, error: currentError } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", true)
      .maybeSingle();
    if (currentError) throw currentError;

    const currentSettings =
      (current?.settings && typeof current.settings === "object"
        ? current.settings
        : {}) as Record<string, unknown>;
    const submittedSettings = keepActiveSettings(body.settings);
    const existingSettings = keepActiveSettings(currentSettings);
    let settingsToSave = applyGoalSettings(existingSettings, submittedSettings);

    if (adminProfile.role === "super_admin") {
      const checkoutRoute = Object.hasOwn(submittedSettings, "checkoutRoute")
        ? normalizeCheckoutRoute(submittedSettings.checkoutRoute)
        : normalizeCheckoutRoute(existingSettings.checkoutRoute);
      const highPaymentSuperAdminEnabled =
        Object.hasOwn(submittedSettings, "highPaymentSuperAdminEnabled")
          ? isEnabled(submittedSettings.highPaymentSuperAdminEnabled)
          : isEnabled(existingSettings.highPaymentSuperAdminEnabled);
      settingsToSave = {
        ...settingsToSave,
        checkoutRoute,
        highPaymentSuperAdminEnabled,
      };
    } else {
      settingsToSave = {
        ...settingsToSave,
        checkoutRoute: normalizeCheckoutRoute(existingSettings.checkoutRoute),
        highPaymentSuperAdminEnabled: isEnabled(
          existingSettings.highPaymentSuperAdminEnabled,
        ),
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
