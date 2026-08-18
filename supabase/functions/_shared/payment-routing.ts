export const HIGH_PAYMENT_THRESHOLD_CENTS = 2100;

export function normalizePaymentRoute(value: unknown) {
  return value === "superadmin" ? "superadmin" : "standard";
}

export function resolvePaymentRoute(
  defaultRoute: unknown,
  highPaymentSuperAdminEnabled: boolean,
  amountCents: number,
) {
  if (highPaymentSuperAdminEnabled && amountCents >= HIGH_PAYMENT_THRESHOLD_CENTS) {
    return "superadmin";
  }

  return normalizePaymentRoute(defaultRoute);
}
