// Every price from the API (PlanTemplate.price, CreditPackage.price) is
// always in INR -- that's the one source of truth an admin edits. USD is
// computed from it here for display, with the same fixed rate the backend
// uses to actually charge it (billing_controller calls chargeAmount with
// this same math) -- must stay identical to USD_RATE in backend/utils/
// currency.js, or the price shown here and the amount actually charged at
// checkout would disagree. Two separate codebases, so there's no way to
// literally share the constant -- only to remember to update both.
export const USD_RATE = 88;

export type BillingCurrency = "INR" | "USD";

export function toUsd(inrAmount: number): number {
  // Genuinely free stays free in any currency -- only a real (non-zero)
  // price gets floored to $1 so it never rounds down to a confusing "$0".
  if (inrAmount <= 0) return 0;
  return Math.max(1, Math.round(inrAmount / USD_RATE));
}

// The amount to actually display/charge for a given INR base price in the
// selected currency -- mirrors the backend's chargeAmount exactly.
export function chargeAmount(inrPrice: number, currency: BillingCurrency): number {
  return currency === "USD" ? toUsd(inrPrice) : inrPrice;
}

export function formatAmount(amount: number, currency: BillingCurrency): string {
  return currency === "USD" ? `$${amount}` : `₹${amount}`;
}

// The inrPrice -> displayed-amount-in-selected-currency shortcut every price
// label on the pricing/billing pages uses.
export function formatPrice(inrPrice: number, currency: BillingCurrency): string {
  return formatAmount(chargeAmount(inrPrice, currency), currency);
}
