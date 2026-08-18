import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { getRandomOrderRequest } from "../_shared/order-requests.ts";
import { createPayPalOrder, parseMoneyToCents } from "../_shared/paypal.ts";
import { normalizePaymentRoute, resolvePaymentRoute } from "../_shared/payment-routing.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

type CreateOrderBody = {
  amount?: number;
  name?: string;
  frequency?: string;
  message?: string;
  email?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const MIN_AMOUNT_CENTS = 700;

async function getCheckoutSettings() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("site_settings").select("settings").eq("id", true).maybeSingle();

  if (error) throw error;

  const settings = data?.settings && typeof data.settings === "object" ? data.settings : {};
  return {
    checkoutRoute: normalizePaymentRoute((settings as Record<string, unknown>).checkoutRoute),
    highPaymentSuperAdminEnabled:
      (settings as Record<string, unknown>).highPaymentSuperAdminEnabled === true ||
      (settings as Record<string, unknown>).highPaymentSuperAdminEnabled === "true",
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CreateOrderBody>(request);
    const amountCents = parseMoneyToCents(body.amount);
    const displayName = String(body.name || "Customer").trim().slice(0, 80) || "Customer";
    const frequency = body.frequency === "monthly" ? "monthly" : "once";
    const supporterMessage = getRandomOrderRequest();
    const contactEmail = String(body.email || "").trim().slice(0, 160);

    if (amountCents < MIN_AMOUNT_CENTS) return errorResponse("Amount must be at least $7.", 422);
    if (!isValidEmail(contactEmail)) return errorResponse("A valid email is required for the order detail.", 422);

    const { checkoutRoute, highPaymentSuperAdminEnabled } = await getCheckoutSettings();
    const paymentRoute = resolvePaymentRoute(checkoutRoute, highPaymentSuperAdminEnabled, amountCents);

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
