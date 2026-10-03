"use client";

import type { BillingCurrency } from "@/lib/currency";

// Shared between /pricing and /dashboard/billing -- both let the shopper
// switch currency, so this stays one component instead of two near-
// identical pill toggles drifting apart over time.
export default function CurrencyToggle({
  value,
  onChange,
  className = "",
}: {
  value: BillingCurrency;
  onChange: (currency: BillingCurrency) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center bg-secondary/60 rounded-full p-1 gap-1 ${className}`}>
      {(["USD", "INR"] as const).map((currency) => (
        <button
          key={currency}
          type="button"
          onClick={() => onChange(currency)}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            value === currency ? "bg-brand-blue text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {currency === "USD" ? "$ USD" : "₹ INR"}
        </button>
      ))}
    </div>
  );
}
