const PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export const DIGITAL_ORDER_ITEM_NAME = "Personalised Digital Blessing and Sowing Seed";

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function createDigitalOrderNumber(date = new Date()) {
  const datePart = [
    date.getUTCFullYear(),
    padDatePart(date.getUTCMonth() + 1),
    padDatePart(date.getUTCDate()),
  ].join("");
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();

  return `SYS-${datePart}-${randomPart}`;
}

export function getPayPalBaseUrl() {
  const env = (Deno.env.get("PAYPAL_ENV") || "sandbox").toLowerCase();
  return PAYPAL_API_BASE[env === "live" ? "live" : "sandbox"];
}

export function getPayPalCurrency() {
  return Deno.env.get("PAYPAL_CURRENCY") || "USD";
}

export function parseMoneyToCents(value: unknown) {
  const normalized = String(value ?? "").trim().replace(/^\$/, "");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return 0;

  const [dollarsPart, centsPart = ""] = normalized.split(".");
  const dollars = Number.parseInt(dollarsPart, 10);
  const cents = Number.parseInt(centsPart.padEnd(2, "0") || "0", 10);

  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) return 0;

  return dollars * 100 + cents;
}

export function centsToMoney(cents: number) {
  return Math.max(Number(cents) || 0, 0) / 100;
}

export function formatMoneyFromCents(cents: number) {
  return centsToMoney(cents).toFixed(2);
}

export function getReceiverIdentifierFromPayPalOrder(order: Record<string, any>) {
  const payee = order.purchase_units?.[0]?.payee || {};

  return String(payee.merchant_id || payee.email_address || "").trim() || null;
}

export function getPayPalClientId() {
  return Deno.env.get("PAYPAL_CLIENT_ID") || "";
}

function getPayPalClientSecret() {
  return Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
}

function assertPayPalCredentials() {
  const clientId = getPayPalClientId();
  const clientSecret = getPayPalClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials.");
  }

  return { clientId, clientSecret };
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = assertPayPalCredentials();
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
  amountCents: number;
  displayName: string;
  frequency: string;
  supporterMessage?: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const currency = getPayPalCurrency();
  const amount = formatMoneyFromCents(input.amountCents);
  const orderNumber = createDigitalOrderNumber();
  const purchaseUnit: Record<string, any> = {
    description: DIGITAL_ORDER_ITEM_NAME,
    custom_id: orderNumber,
    amount: {
      currency_code: currency,
      value: amount,
    },
  };

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
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

function getWebhookId() {
  return Deno.env.get("PAYPAL_WEBHOOK_ID") || "";
}

export async function verifyPayPalWebhook(headers: Headers, body: string) {
  const webhookId = getWebhookId();

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

  return {
    ...payload,
    paymentRoute: "standard",
  };
}
