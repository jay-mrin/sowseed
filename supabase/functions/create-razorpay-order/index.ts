import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { createRazorpayOrder, formatMoneyFromPaise, getRazorpayKeyId, getRazorpayCurrency, parseMoneyToPaise } from "../_shared/razorpay.ts";
import { createDigitalOrderNumber } from "../_shared/paypal.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

type CreateOrderBody = {
  amount?: number;
  name?: string;
  frequency?: string;
  message?: string;
  email?: string;
};

const MIN_AMOUNT_PAISE = 700;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function isRazorpayEnabled() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("site_settings").select("settings").eq("id", true).maybeSingle();
  if (error) throw error;

  const settings = data?.settings && typeof data.settings === "object" ? data.settings : {};
  return (
    (settings as Record<string, unknown>).razorpayEnabled !== false &&
    (settings as Record<string, unknown>).razorpayEnabled !== "false"
  );
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CreateOrderBody>(request);
    const amountPaise = parseMoneyToPaise(body.amount);
    const displayName = String(body.name || "").trim().slice(0, 80);
    const frequency = body.frequency === "monthly" ? "monthly" : "once";
    const supporterMessage = String(body.message || "").trim().slice(0, 280);
    const contactEmail = String(body.email || "").trim().slice(0, 160);

    if (amountPaise < MIN_AMOUNT_PAISE) return errorResponse("Amount must be at least $7.", 422);
    if (!displayName) return errorResponse("Display name is required.", 422);
    if (!isValidEmail(contactEmail)) return errorResponse("A valid email is required for the order detail.", 422);
    if (!(await isRazorpayEnabled())) return errorResponse("Razorpay checkout is currently disabled.", 403);

    const orderNumber = createDigitalOrderNumber();
    const order = await createRazorpayOrder({
      amountPaise,
      currency: getRazorpayCurrency(),
      receipt: orderNumber,
      notes: {
        displayName,
        frequency,
        supporterMessage,
        contactEmail,
        itemName: "Personalised Digital Blessing and Sowing Seed",
      },
    });

    return jsonResponse({
      id: order.id,
      amount: order.amount,
      currency: order.currency || getRazorpayCurrency(),
      keyId: getRazorpayKeyId(),
      receipt: order.receipt || orderNumber,
      status: order.status,
      orderNumber,
      paymentMode: "test",
      amountMoney: formatMoneyFromPaise(Number(order.amount) || amountPaise),
    });
  } catch (error) {
    return errorResponse("Could not create Razorpay order.", 500, String(error));
  }
});
