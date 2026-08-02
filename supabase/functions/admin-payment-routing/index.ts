import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { updateLargeDonationRoutingEnabled, isLargeDonationRoutingEnabled } from "../_shared/site-settings.ts";
import { requireAdmin } from "../_shared/supabase.ts";

type RoutingBody = {
  largeDonationRoutingEnabled?: boolean;
};

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request, { allowedRoles: ["super_admin"] });

    if (request.method === "GET") {
      return jsonResponse({
        largeDonationRoutingEnabled: await isLargeDonationRoutingEnabled(supabase),
      });
    }

    if (request.method !== "POST" && request.method !== "PUT") {
      return errorResponse("Method not allowed.", 405);
    }

    const body = await readJson<RoutingBody>(request);

    if (typeof body.largeDonationRoutingEnabled !== "boolean") {
      return errorResponse("Routing toggle value is required.", 422);
    }

    const result = await updateLargeDonationRoutingEnabled(supabase, body.largeDonationRoutingEnabled);

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not update payment routing.", 500, String(error));
  }
});
