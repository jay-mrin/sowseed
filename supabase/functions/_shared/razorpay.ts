const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export function getRazorpayKeyId() {
  return Deno.env.get("RAZORPAY_KEY_ID") || "";
}

export function getRazorpayKeySecret() {
  return Deno.env.get("RAZORPAY_KEY_SECRET") || "";
}

export function getRazorpayCurrency() {
  return Deno.env.get("RAZORPAY_CURRENCY") || "USD";
}

export function parseMoneyToPaise(value: unknown) {
  const normalized = String(value ?? "").trim().replace(/^\$/, "");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return 0;

  const [dollarsPart, centsPart = ""] = normalized.split(".");
  const dollars = Number.parseInt(dollarsPart, 10);
  const cents = Number.parseInt(centsPart.padEnd(2, "0") || "0", 10);

  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) return 0;

  return dollars * 100 + cents;
}

export function paiseToMoney(paise: number) {
  return Math.max(Number(paise) || 0, 0) / 100;
}

export function formatMoneyFromPaise(paise: number) {
  return paiseToMoney(paise).toFixed(2);
}

export function createRazorpayReceipt(orderNumber: string) {
  return `sys_${orderNumber.replaceAll("-", "_").toLowerCase()}`;
}

async function razorpayRequest<T>(path: string, init: RequestInit = {}) {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials.");
  }

  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Razorpay request failed: ${JSON.stringify(payload)}`);
  }

  return payload as T;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return await razorpayRequest<Record<string, any>>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: input.currency || getRazorpayCurrency(),
      receipt: input.receipt,
      payment_capture: 1,
      notes: input.notes || {},
    }),
  });
}

export async function fetchRazorpayPayment(paymentId: string) {
  return await razorpayRequest<Record<string, any>>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });
}

export async function captureRazorpayPayment(paymentId: string, amountPaise: number, currency?: string) {
  return await razorpayRequest<Record<string, any>>(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: "POST",
    body: JSON.stringify({
      amount: amountPaise,
      currency: currency || getRazorpayCurrency(),
    }),
  });
}

export async function signRazorpaySignature(orderId: string, paymentId: string) {
  const keySecret = getRazorpayKeySecret();

  if (!keySecret) throw new Error("Missing Razorpay secret.");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = await signRazorpaySignature(orderId, paymentId);
  return expected === String(signature || "").trim().toLowerCase();
}
