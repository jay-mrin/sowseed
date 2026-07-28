import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { verifyPayPalWebhook } from "../_shared/paypal.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const rawBody = await request.text();
    await verifyPayPalWebhook(request.headers, rawBody);

    const event = JSON.parse(rawBody);
    const resource = event.resource || {};
    const captureId = resource.id;
    const status = resource.status;

    if (captureId && status) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from("donations")
        .update({
          paypal_status: status,
          raw_payment: event,
        })
        .eq("paypal_capture_id", captureId);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    return errorResponse("PayPal webhook rejected.", 400, String(error));
  }
});
