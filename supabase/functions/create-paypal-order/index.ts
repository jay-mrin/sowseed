import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { createPayPalOrder, parseMoneyToCents } from "../_shared/paypal.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

type CreateOrderBody = {
  amount?: number;
  name?: string;
  frequency?: string;
  message?: string;
  email?: string;
  paymentRoute?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePaymentRoute(value: unknown) {
  return value === "superadmin" ? "superadmin" : "standard";
}

async function getCheckoutRoute() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("site_settings").select("settings").eq("id", true).maybeSingle();

  if (error) throw error;

  const settings = data?.settings && typeof data.settings === "object" ? data.settings : {};
  return normalizePaymentRoute((settings as Record<string, unknown>).checkoutRoute);
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CreateOrderBody>(request);
    const amountCents = parseMoneyToCents(body.amount);
    const displayName = String(body.name || "").trim().slice(0, 80);
    const frequency = body.frequency === "monthly" ? "monthly" : "once";
    const supporterMessage = String(body.message || "").trim().slice(0, 280);
    const contactEmail = String(body.email || "").trim().slice(0, 160);

    if (amountCents < 100) return errorResponse("Amount must be at least $1.", 422);
    if (!displayName) return errorResponse("Display name is required.", 422);
    if (!isValidEmail(contactEmail)) return errorResponse("A valid email is required for the order detail.", 422);

    const paymentRoute = await getCheckoutRoute();

    const order = await createPayPalOrder({
      amountCents,
      displayName,
      frequency,
      supporterMessage,
      paymentRoute,
    });

    return jsonResponse({
      id: order.id,
      status: order.status,
      paymentRoute,
    });
  } catch (error) {
    return errorResponse("Could not create PayPal order.", 500, String(error));
  }
});
