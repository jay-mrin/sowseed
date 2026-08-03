import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { createPayPalOrder, parseMoneyToCents } from "../_shared/paypal.ts";

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

    const order = await createPayPalOrder({
      amountCents,
      displayName,
      frequency,
      supporterMessage,
    });

    return jsonResponse({
      id: order.id,
      status: order.status,
      paymentRoute: "standard",
    });
  } catch (error) {
    return errorResponse("Could not create PayPal order.", 500, String(error));
  }
});
