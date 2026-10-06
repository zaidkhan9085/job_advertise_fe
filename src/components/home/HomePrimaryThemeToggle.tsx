"use client";

import { useState } from "react";

// Lets the client preview "dark primary" (Navy, --brand-blue overridden via
// the data attribute below) against today's "light primary" (Signal) on the
// live homepage, side by side, before committing to one. Plain component
// state -- no persistence needed, this is a one-off comparison tool, not a
// real user preference. The CSS override itself lives in globals.css under
// [data-primary-variant="dark"]; every component using bg-brand-blue/
// text-brand-blue/etc. picks it up automatically through the normal CSS
// variable cascade, no component changes needed.
export default function HomePrimaryThemeToggle({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<"light" | "dark">("light");

  return (
    <div data-primary-variant={variant}>
      {children}

      <div className="fixed bottom-5 right-5 z-50 bg-white rounded-full shadow-xl border border-border/60 p-1 flex items-center gap-1 text-sm font-bold">
        <button
          onClick={() => setVariant("light")}
          className={`px-4 py-2 rounded-full transition-colors ${
            variant === "light" ? "bg-brand-blue text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Light primary
        </button>
        <button
          onClick={() => setVariant("dark")}
          className={`px-4 py-2 rounded-full transition-colors ${
            variant === "dark" ? "bg-brand-blue text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dark primary
        </button>
      </div>
    </div>
  );
}
