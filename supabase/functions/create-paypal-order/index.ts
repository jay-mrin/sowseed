import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { createPayPalOrder, parseMoneyToCents } from "../_shared/paypal.ts";
import { isLargeDonationRoutingEnabled } from "../_shared/site-settings.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

type CreateOrderBody = {
  amount?: number;
  name?: string;
  frequency?: string;
  message?: string;
};

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CreateOrderBody>(request);
    const amountCents = parseMoneyToCents(body.amount);
    const displayName = String(body.name || "").trim().slice(0, 80);
    const frequency = body.frequency === "monthly" ? "monthly" : "once";
    const supporterMessage = String(body.message || "").trim().slice(0, 280);

    if (amountCents < 100) return errorResponse("Amount must be at least $1.", 422);
    if (!displayName) return errorResponse("Display name is required.", 422);

    const supabase = getSupabaseAdmin();
    const largeDonationRoutingEnabled = await isLargeDonationRoutingEnabled(supabase);
    const order = await createPayPalOrder({
      amountCents,
      displayName,
      frequency,
      largeDonationRoutingEnabled,
      supporterMessage,
    });

    return jsonResponse({
      id: order.id,
      status: order.status,
      paymentRoute: order.routing?.route || "standard",
    });
  } catch (error) {
    if (String(error).includes("Large donation receiver is not configured")) {
      return errorResponse("Large donation receiver is not configured yet.", 422);
    }

    if (String(error).includes("Missing large PayPal gateway credentials")) {
      return errorResponse("Large donation PayPal gateway is not configured yet.", 422);
    }

    return errorResponse("Could not create PayPal order.", 500, String(error));
  }
});
