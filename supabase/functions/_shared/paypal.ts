const PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export const DIGITAL_ORDER_ITEM_NAME = "Personalised Digital Blessing and Sowing Seed";
export type PaymentRoute = "standard" | "large";

export type PayPalRouting = {
  route: PaymentRoute;
  thresholdCents: number;
  receiverIdentifier: string | null;
};

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

export function getLargeDonationThresholdCents() {
  const configuredThreshold = Deno.env.get("PAYPAL_LARGE_DONATION_THRESHOLD") || "99";
  const thresholdCents = parseMoneyToCents(configuredThreshold);

  return thresholdCents > 0 ? thresholdCents : 9900;
}

export function getReceiverIdentifierFromPayPalOrder(order: Record<string, any>) {
  const payee = order.purchase_units?.[0]?.payee || {};

  return String(payee.merchant_id || payee.email_address || "").trim() || null;
}

export function resolvePayPalRouting(
  amountCents: number,
  options: {
    largeDonationRoutingEnabled?: boolean;
  } = {},
): PayPalRouting {
  const thresholdCents = getLargeDonationThresholdCents();

  if (options.largeDonationRoutingEnabled === false || amountCents <= thresholdCents) {
    return {
      route: "standard",
      thresholdCents,
      receiverIdentifier: null,
    };
  }

  const merchantId = String(Deno.env.get("PAYPAL_LARGE_PAYEE_MERCHANT_ID") || "").trim();
  const emailAddress = String(Deno.env.get("PAYPAL_LARGE_PAYEE_EMAIL") || "").trim();
  const receiverIdentifier = merchantId || emailAddress || null;

  return {
    route: "large",
    thresholdCents,
    receiverIdentifier,
  };
}

export function getPayPalClientId(route: PaymentRoute = "standard") {
  if (route === "large") {
    return (
      Deno.env.get("PAYPAL_LARGE_CLIENT_ID") ||
      Deno.env.get("SUPER_ADMIN_PAYPAL_CLIENT_ID") ||
      ""
    );
  }

  return Deno.env.get("PAYPAL_CLIENT_ID") || "";
}

function getPayPalClientSecret(route: PaymentRoute = "standard") {
  if (route === "large") {
    return Deno.env.get("PAYPAL_LARGE_CLIENT_SECRET") || Deno.env.get("SUPER_ADMIN_PAYPAL_CLIENT_SECRET") || "";
  }

  return Deno.env.get("PAYPAL_CLIENT_SECRET") || "";
}

function assertPayPalCredentials(route: PaymentRoute) {
  const clientId = getPayPalClientId(route);
  const clientSecret = getPayPalClientSecret(route);

  if (!clientId || !clientSecret) {
    throw new Error(route === "large" ? "Missing large PayPal gateway credentials." : "Missing PayPal credentials.");
  }

  return { clientId, clientSecret };
}

export function assertLargeGatewayReady() {
  const { receiverIdentifier } = resolvePayPalRouting(getLargeDonationThresholdCents() + 1, {
    largeDonationRoutingEnabled: true,
  });
  assertPayPalCredentials("large");

  if (!receiverIdentifier) {
    throw new Error("Large donation receiver is not configured.");
  }
}

export async function getPayPalAccessToken(route: PaymentRoute = "standard") {
  const { clientId, clientSecret } = assertPayPalCredentials(route);
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
  largeDonationRoutingEnabled?: boolean;
  supporterMessage?: string;
}) {
  const routing = resolvePayPalRouting(input.amountCents, {
    largeDonationRoutingEnabled: input.largeDonationRoutingEnabled,
  });

  if (routing.route === "large") {
    assertLargeGatewayReady();
  }

  const accessToken = await getPayPalAccessToken(routing.route);
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

  return { ...payload, routing };
}

export async function capturePayPalOrder(orderId: string, route: PaymentRoute = "standard") {
  const accessToken = await getPayPalAccessToken(route);
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

function getWebhookId(route: PaymentRoute = "standard") {
  if (route === "large") {
    return Deno.env.get("PAYPAL_LARGE_WEBHOOK_ID") || Deno.env.get("SUPER_ADMIN_PAYPAL_WEBHOOK_ID") || "";
  }

  return Deno.env.get("PAYPAL_WEBHOOK_ID") || "";
}

async function verifyPayPalWebhookForRoute(headers: Headers, body: string, route: PaymentRoute) {
  const webhookId = getWebhookId(route);

  if (!webhookId) {
    throw new Error(route === "large" ? "Missing PAYPAL_LARGE_WEBHOOK_ID." : "Missing PAYPAL_WEBHOOK_ID.");
  }

  const accessToken = await getPayPalAccessToken(route);
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
    throw new Error(`PayPal ${route} webhook verification failed: ${JSON.stringify(payload)}`);
  }

  return {
    ...payload,
    paymentRoute: route,
  };
}

export async function verifyPayPalWebhook(headers: Headers, body: string) {
  const errors: string[] = [];

  for (const route of ["standard", "large"] as PaymentRoute[]) {
    try {
      return await verifyPayPalWebhookForRoute(headers, body, route);
    } catch (error) {
      errors.push(String(error));
    }
  }

  throw new Error(`PayPal webhook verification failed for every configured gateway: ${errors.join(" | ")}`);
}
