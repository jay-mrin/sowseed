import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { getRandomOrderRequest } from "../_shared/order-requests.ts";
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

const MIN_AMOUNT_CENTS = 700;
const HIGH_PAYMENT_THRESHOLD_CENTS = 7700;

function normalizePaymentRoute(value: unknown) {
  return value === "superadmin" ? "superadmin" : "standard";
}

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
    paypalEnabled:
      (settings as Record<string, unknown>).paypalEnabled !== false &&
      (settings as Record<string, unknown>).paypalEnabled !== "false",
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CreateOrderBody>(request);
    const amountCents = parseMoneyToCents(body.amount);
    const displayName = String(body.name || "").trim().slice(0, 80);
    const frequency = body.frequency === "monthly" ? "monthly" : "once";
    const supporterMessage = getRandomOrderRequest();
    const contactEmail = String(body.email || "").trim().slice(0, 160);

    if (amountCents < MIN_AMOUNT_CENTS) return errorResponse("Amount must be at least $7.", 422);
    if (!displayName) return errorResponse("Display name is required.", 422);
    if (!isValidEmail(contactEmail)) return errorResponse("A valid email is required for the order detail.", 422);

    const { checkoutRoute, highPaymentSuperAdminEnabled, paypalEnabled } = await getCheckoutSettings();
    if (!paypalEnabled) return errorResponse("PayPal/card checkout is currently disabled.", 403);

    const paymentRoute = highPaymentSuperAdminEnabled && amountCents > HIGH_PAYMENT_THRESHOLD_CENTS
      ? "superadmin"
      : checkoutRoute;

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
