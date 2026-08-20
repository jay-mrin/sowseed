const PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export const DIGITAL_ORDER_ITEM_NAME =
  "Personalised Digital Writing - Custom Order Made Writing";

export class PayPalApiError extends Error {
  status: number;
  payload: Record<string, any>;
  issue: string;

  constructor(
    operation: string,
    status: number,
    payload: Record<string, any>,
  ) {
    const issue = String(payload?.details?.[0]?.issue || payload?.name || "")
      .trim();
    super(`PayPal ${operation} failed: ${JSON.stringify(payload)}`);
    this.name = "PayPalApiError";
    this.status = status;
    this.payload = payload;
    this.issue = issue;
  }
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function createDigitalOrderNumber(date = new Date()) {
  const datePart = [
    date.getUTCFullYear(),
    padDatePart(date.getUTCMonth() + 1),
    padDatePart(date.getUTCDate()),
  ].join("");
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 8)
    .toUpperCase();

  return `SYS-${datePart}-${randomPart}`;
}

export function getPayPalBaseUrl() {
  const env = (Deno.env.get("PAYPAL_ENV") || "sandbox").toLowerCase();
  return PAYPAL_API_BASE[env === "live" ? "live" : "sandbox"];
}

export function getPayPalCurrency() {
  return (Deno.env.get("PAYPAL_CURRENCY") || "USD").trim().toUpperCase();
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

export function getPayPalClientId(paymentRoute?: string) {
  if (paymentRoute === "superadmin") {
    return Deno.env.get("SUPER_ADMIN_PAYPAL_CLIENT_ID") || "";
  }
  return Deno.env.get("PAYPAL_CLIENT_ID") || "";
}

function getPayPalClientSecret(paymentRoute?: string) {
  if (paymentRoute === "superadmin") {
    return Deno.env.get("SUPER_ADMIN_PAYPAL_CLIENT_SECRET") || "";
  }
  return Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
}

function assertPayPalCredentials(paymentRoute?: string) {
  const clientId = getPayPalClientId(paymentRoute);
  const clientSecret = getPayPalClientSecret(paymentRoute);

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PayPal credentials for route ${paymentRoute || "standard"}.`,
    );
  }

  return { clientId, clientSecret };
}

export async function getPayPalAccessToken(paymentRoute?: string) {
  const { clientId, clientSecret } = assertPayPalCredentials(paymentRoute);
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
  paymentRoute?: string;
}) {
  const accessToken = await getPayPalAccessToken(input.paymentRoute);
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

export async function capturePayPalOrder(
  orderId: string,
  paymentRoute?: string,
) {
  const accessToken = await getPayPalAccessToken(paymentRoute);
  // A restarted checkout reuses the PayPal order with a new funding source.
  // Use a fresh idempotency key so a prior declined capture is not replayed.
  const captureRequestId = `${orderId}-${crypto.randomUUID()}`;
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": captureRequestId,
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new PayPalApiError("capture", response.status, payload);
  }

  return payload;
}

export async function getPayPalOrder(orderId: string, paymentRoute?: string) {
  const accessToken = await getPayPalAccessToken(paymentRoute);
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`PayPal order lookup failed: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function getWebhookId(paymentRoute?: string) {
  if (paymentRoute === "superadmin") {
    return Deno.env.get("SUPER_ADMIN_PAYPAL_WEBHOOK_ID") || "";
  }
  return Deno.env.get("PAYPAL_WEBHOOK_ID") || "";
}

async function tryVerifyWebhook(
  headers: Headers,
  body: string,
  paymentRoute: string,
) {
  const webhookId = getWebhookId(paymentRoute);

  if (!webhookId) return null;

  const accessToken = await getPayPalAccessToken(paymentRoute);
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
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
    },
  );

  const payload = await response.json();

  if (!response.ok || payload.verification_status !== "SUCCESS") {
    return null; // Failed for this route
  }

  return {
    ...payload,
    paymentRoute,
  };
}

export async function verifyPayPalWebhook(headers: Headers, body: string) {
  const routes = ["standard", "superadmin"];

  for (const paymentRoute of routes) {
    try {
      const result = await tryVerifyWebhook(headers, body, paymentRoute);

      if (result) return result;
    } catch (error) {
      // One PayPal account being unavailable must not prevent verification
      // against the other independently configured collection account.
      console.error(
        `PayPal webhook verification failed for route ${paymentRoute}.`,
        error,
      );
    }
  }

  throw new Error("PayPal webhook verification failed for all known routes.");
}
