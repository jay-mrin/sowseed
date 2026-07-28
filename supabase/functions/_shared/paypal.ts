const PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export function getPayPalBaseUrl() {
  const env = (Deno.env.get("PAYPAL_ENV") || "sandbox").toLowerCase();
  return PAYPAL_API_BASE[env === "live" ? "live" : "sandbox"];
}

export function getPayPalCurrency() {
  return Deno.env.get("PAYPAL_CURRENCY") || "USD";
}

export async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials.");
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed: ${JSON.stringify(payload)}`);
  }

  return payload.access_token as string;
}

export async function createPayPalOrder(input: {
  amount: number;
  displayName: string;
  frequency: string;
  supporterMessage?: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const currency = getPayPalCurrency();
  const amount = input.amount.toFixed(2);

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: "Voluntary creator tip for Sow Your Seed",
          custom_id: crypto.randomUUID(),
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`PayPal order creation failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": orderId,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`PayPal capture failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}

export async function verifyPayPalWebhook(headers: Headers, body: string) {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");

  if (!webhookId) {
    throw new Error("Missing PAYPAL_WEBHOOK_ID.");
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  const payload = await response.json();

  if (!response.ok || payload.verification_status !== "SUCCESS") {
    throw new Error(`PayPal webhook verification failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}
