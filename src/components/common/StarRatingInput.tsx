"use client";

import { Star } from "lucide-react";

// Extracted from the public job detail page's inline click-to-rate UI --
// same look/behavior, just reusable (also used by the admin Employer
// detail page's own rating control, see project bug list "admin can
// increase employer rating").
//
// Clicking the star that's already the current value clears the rating
// instead of resubmitting it -- without this, a rating could only ever be
// lowered as far as 1 star, with no way to fully revert back to "not
// rated" (a real bug: an accidental click had no way to undo itself).
export default function StarRatingInput({
  value,
  onChange,
  onClear,
  size = "w-6 h-6",
}: {
  value: number;
  onChange: (rating: number) => void;
  onClear?: () => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => (n === value && onClear ? onClear() : onChange(n))}
          title={n === value ? "Click to remove your rating" : `${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} transition-colors ${n <= value ? "text-amber-400" : "text-border hover:text-amber-300"}`}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
