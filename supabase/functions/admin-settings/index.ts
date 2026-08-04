import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request, { allowedRoles: ["admin", "super_admin"] });

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

    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ id: true, settings: body.settings }, { onConflict: "id" })
      .select("settings")
      .single();

    if (error) throw error;
    return jsonResponse({ settings: data.settings });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not save admin settings.", 500, String(error));
  }
});
