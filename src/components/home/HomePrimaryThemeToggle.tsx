"use client";

import { useState } from "react";

type Variant = "light" | "dark" | "gradient";

const OPTIONS: { value: Variant; label: string }[] = [
  { value: "light", label: "Light primary" },
  { value: "dark", label: "Dark primary" },
  { value: "gradient", label: "Logo gradient" },
];

// Lets the client preview three primary-color treatments on the live
// homepage, side by side, before committing to one: today's "light"
// (Signal), "dark" (Navy, flat), and "gradient" -- the logo mark's own
// Signal->Navy gradient applied to buttons and heading accents instead of a
// flat fill, since sampling the actual logo artwork showed its two figures
// are exactly those two colors blended, not a third distinct hue. Plain
// component state -- no persistence needed, this is a one-off comparison
// tool, not a real user preference. The CSS for all three lives in
// globals.css under [data-primary-variant="dark"|"gradient"]; every
// component using bg-brand-blue/text-brand-blue/etc. picks it up
// automatically through the normal CSS cascade, no component changes
// needed elsewhere.
export default function HomePrimaryThemeToggle({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>("light");

  return (
    <div data-primary-variant={variant}>
      {children}

      <div className="fixed bottom-5 right-5 z-50 bg-white rounded-full shadow-xl border border-border/60 p-1 flex items-center gap-1 text-sm font-bold">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setVariant(o.value)}
            className={`px-4 py-2 rounded-full transition-colors ${
              variant === o.value ? "bg-brand-blue text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
