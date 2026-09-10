import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared between every place that builds or reads a `?location=` deep link
// (homepage sections, /jobs's own URL sync) -- must stay byte-for-byte
// identical on both the writing and reading side, or a link-through silently
// fails to resolve back to a real location.
export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
