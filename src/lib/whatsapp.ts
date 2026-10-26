// Every wa.me link builder in this app used to just strip non-digit
// characters and nothing else -- a bare 10-digit Indian mobile number (no
// country code typed) went straight into the URL with no "91" prepended,
// and a number stored with its STD-style leading "0" (e.g. "044-128-69")
// kept that leading zero. WhatsApp's own client then has to guess a
// country for an ambiguous, code-less number and sometimes guesses wrong
// (confirmed live: a stored "044-128-69" opened a chat titled
// "+81 0 44-128-69" instead of failing cleanly or using India).
//
// This is the one place that decision gets made -- every call site below
// should go through this instead of its own inline regex.
export function normalizeForWhatsApp(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";

  // An explicit "+<country code>" is the user's own unambiguous intent
  // (could be a non-Indian number) -- trust it and only strip the
  // formatting, never touch the digits themselves.
  if (trimmed.startsWith("+")) {
    return trimmed.replace(/\D/g, "");
  }

  let digits = trimmed.replace(/\D/g, "");

  // Already carries the 91 country code without a "+" (e.g. typed as
  // "919876543210") -- leave it alone, prepending 91 again would double it.
  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }

  // A domestic STD-style leading 0 (the "044..." trunk prefix) isn't part
  // of the actual subscriber number and must come off before a country
  // code goes on, or the number is wrong either way.
  digits = digits.replace(/^0+/, "");

  // A plain 10-digit Indian mobile number -- this app's whole userbase is
  // India-first (same default src/components/common/PhoneInput.tsx uses),
  // so a bare 10-digit number with no code gets 91.
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // Anything else (too short, too long, already malformed on entry) is
  // returned as-is -- best effort, not a guess at a different country.
  return digits;
}

export function buildWaMeUrl(rawNumber: string, text?: string): string {
  const number = normalizeForWhatsApp(rawNumber);
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number}${query}`;
}
