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

// Used by the header nav's live filter shortcuts (Industry/Location/Jobs
// Opening/Short Term) -- ADDS `value` into `paramKey`'s existing
// comma-separated list (and keeps every other param untouched) instead of
// replacing the whole query string. Without this, clicking a header
// filter while already on /jobs with other filters selected below would
// wipe them out instead of combining with them. Passing the current
// page's own searchParams when not on /jobs is harmless -- they're empty,
// so this just produces a fresh `/jobs?paramKey=value` link exactly like
// before.
export function buildMergedJobsUrl(currentParams: URLSearchParams, paramKey: string, value: string): string {
  const params = new URLSearchParams(currentParams.toString());
  const existing = params.get(paramKey);
  const values = existing ? existing.split(",").filter(Boolean) : [];
  if (!values.includes(value)) values.push(value);
  params.set(paramKey, values.join(","));
  return `/jobs?${params.toString()}`;
}

// navigator.clipboard only exists in secure contexts (https / localhost) --
// opening the dev server from a phone over the LAN (http://192.168.x.x) or
// any non-secure host has no clipboard API at all, and it can also reject
// when the tab isn't focused. Falls back to the older textarea +
// execCommand path so "Share -> copy link" still works there.
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
