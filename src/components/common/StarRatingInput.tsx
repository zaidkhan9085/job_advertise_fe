"use client";

import { Star } from "lucide-react";

// Extracted from the public job detail page's inline click-to-rate UI --
// same look/behavior, just reusable (also used by the admin Employer
// detail page's own rating control, see project bug list "admin can
// increase employer rating").
export default function StarRatingInput({
  value,
  onChange,
  size = "w-6 h-6",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} title={`${n} star${n > 1 ? "s" : ""}`}>
          <Star
            className={`${size} transition-colors ${n <= value ? "text-amber-400" : "text-border hover:text-amber-300"}`}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
