import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { getRandomOrderRequest } from "../_shared/order-requests.ts";
import { createDigitalOrderNumber } from "../_shared/paypal.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

const MIN_AMOUNT_CENTS = 700;
const WISE_LINKS: Record<string, string> = {
  "7.00": "https://wise.com/pay/r/-9ag02Bl-OR3XQE",
  "11.00": "https://wise.com/pay/r/WY4TpeRhRxuH59s",
  "33.00": "https://wise.com/pay/r/mJuWMux4Z2bY8jc",
  "77.00": "https://wise.com/pay/r/RWNmPnSgsOBRxTg",
  "111.00": "https://wise.com/pay/r/7EuRknMjhFvi4Po",
  "333.00": "https://wise.com/pay/r/C7RcA7__jm-pbLY",
  "777.00": "https://wise.com/pay/r/10ySwhCKUvDihqM",
  "999.00": "https://wise.com/pay/r/e5gfAmKTsfTIhas",
};

type WiseOrderBody = { amount?: number; name?: string; message?: string; email?: string };

function moneyToCents(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    if (request.method !== "POST") return errorResponse("Method not allowed.", 405);

    const body = await readJson<WiseOrderBody>(request);
    const amountCents = moneyToCents(body.amount);
    const amountKey = (amountCents / 100).toFixed(2);
    const paymentLink = WISE_LINKS[amountKey];
    const displayName = String(body.name || "").trim().slice(0, 80);
    const requestText = getRandomOrderRequest();
    const contactEmail = String(body.email || "").trim().slice(0, 160);

    if (amountCents < MIN_AMOUNT_CENTS) return errorResponse("Amount must be at least $7.", 422);
    if (!paymentLink) return errorResponse("Wise is available for the listed order amounts only.", 422);
    if (!displayName) return errorResponse("Your name is required.", 422);
    if (!validEmail(contactEmail)) return errorResponse("A valid email is required for your order detail.", 422);

    const supabase = getSupabaseAdmin();
    const { data: settingsRow, error: settingsError } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", true)
      .maybeSingle();
    if (settingsError) throw settingsError;
    const settings = (settingsRow?.settings && typeof settingsRow.settings === "object" ? settingsRow.settings : {}) as Record<string, unknown>;
    if (settings.wiseEnabled === false || settings.wiseEnabled === "false") {
      return errorResponse("Wise checkout is currently unavailable.", 403);
    }

    const orderNumber = createDigitalOrderNumber();
    const { data: paymentRecord, error: paymentError } = await supabase
      .from("donations")
      .insert({
        display_name: displayName,
        amount: amountCents / 100,
        seed_count: Math.max(1, Math.round(amountCents / 700)),
        frequency: "once",
        supporter_message: requestText || null,
        payment_method: "wise",
        paypal_status: "AWAITING_WISE_CONFIRMATION",
        payment_route: "superadmin",
        visibility_scope: "superadmin_private",
        raw_payment: {
          provider: "Wise",
          paymentLink,
          state: "payment_link_opened",
          orderNumber,
          contactEmail,
        },
      })
      .select("id, created_at")
      .single();
    if (paymentError) throw paymentError;

    const { error: orderError } = await supabase.from("digital_orders").insert({
      order_number: orderNumber,
      donation_id: paymentRecord.id,
      customer_name: displayName,
      contact_email: contactEmail,
      amount: amountCents / 100,
      currency: "USD",
      item_name: "Personalised Digital Writing - Custom Order Made Writing",
      personalized_request: requestText || null,
      fulfillment_status: "awaiting_payment_confirmation",
      fulfillment_note: "Wise payment link opened; confirm payment from Wise before fulfilling the writing.",
    });
    if (orderError) throw orderError;

    return jsonResponse({
      paymentLink,
      orderId: paymentRecord.id,
      orderNumber,
      visibilityScope: "superadmin_private",
    });
  } catch (error) {
    return errorResponse("Could not prepare Wise checkout.", 500, String(error));
  }
});
