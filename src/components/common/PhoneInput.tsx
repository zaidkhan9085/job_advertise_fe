"use client";

import { useMemo, useRef, useState } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

interface CountryCode {
  iso: string;
  name: string;
  flag: string;
  dial: string;
}

// This platform's own served countries (Gulf/India/Asia + the rest of the
// worldwide JobLocation tree) come first so the dropdown's default view is
// relevant to who's actually using it; the remaining common countries are
// appended for genuine worldwide coverage.
const COUNTRY_CODES: CountryCode[] = [
  { iso: "IN", name: "India", flag: "🇮🇳", dial: "+91" },
  { iso: "AE", name: "UAE", flag: "🇦🇪", dial: "+971" },
  { iso: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966" },
  { iso: "QA", name: "Qatar", flag: "🇶🇦", dial: "+974" },
  { iso: "OM", name: "Oman", flag: "🇴🇲", dial: "+968" },
  { iso: "KW", name: "Kuwait", flag: "🇰🇼", dial: "+965" },
  { iso: "BH", name: "Bahrain", flag: "🇧🇭", dial: "+973" },
  { iso: "IQ", name: "Iraq", flag: "🇮🇶", dial: "+964" },
  { iso: "IR", name: "Iran", flag: "🇮🇷", dial: "+98" },
  { iso: "TR", name: "Turkey", flag: "🇹🇷", dial: "+90" },
  { iso: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65" },
  { iso: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60" },
  { iso: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66" },
  { iso: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62" },
  { iso: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63" },
  { iso: "JP", name: "Japan", flag: "🇯🇵", dial: "+81" },
  { iso: "KR", name: "South Korea", flag: "🇰🇷", dial: "+82" },
  { iso: "MV", name: "Maldives", flag: "🇲🇻", dial: "+960" },
  { iso: "MU", name: "Mauritius", flag: "🇲🇺", dial: "+230" },
  { iso: "PK", name: "Pakistan", flag: "🇵🇰", dial: "+92" },
  { iso: "BD", name: "Bangladesh", flag: "🇧🇩", dial: "+880" },
  { iso: "LK", name: "Sri Lanka", flag: "🇱🇰", dial: "+94" },
  { iso: "NP", name: "Nepal", flag: "🇳🇵", dial: "+977" },
  { iso: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { iso: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { iso: "CA", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { iso: "AU", name: "Australia", flag: "🇦🇺", dial: "+61" },
  { iso: "NZ", name: "New Zealand", flag: "🇳🇿", dial: "+64" },
  { iso: "DE", name: "Germany", flag: "🇩🇪", dial: "+49" },
  { iso: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { iso: "ES", name: "Spain", flag: "🇪🇸", dial: "+34" },
  { iso: "IT", name: "Italy", flag: "🇮🇹", dial: "+39" },
  { iso: "NL", name: "Netherlands", flag: "🇳🇱", dial: "+31" },
  { iso: "RU", name: "Russia", flag: "🇷🇺", dial: "+7" },
  { iso: "AZ", name: "Azerbaijan", flag: "🇦🇿", dial: "+994" },
  { iso: "GE", name: "Georgia", flag: "🇬🇪", dial: "+995" },
  { iso: "IL", name: "Israel", flag: "🇮🇱", dial: "+972" },
  { iso: "JO", name: "Jordan", flag: "🇯🇴", dial: "+962" },
  { iso: "KZ", name: "Kazakhstan", flag: "🇰🇿", dial: "+7" },
  { iso: "UZ", name: "Uzbekistan", flag: "🇺🇿", dial: "+998" },
  { iso: "CN", name: "China", flag: "🇨🇳", dial: "+86" },
  { iso: "EG", name: "Egypt", flag: "🇪🇬", dial: "+20" },
  { iso: "ZA", name: "South Africa", flag: "🇿🇦", dial: "+27" },
  { iso: "NG", name: "Nigeria", flag: "🇳🇬", dial: "+234" },
  { iso: "KE", name: "Kenya", flag: "🇰🇪", dial: "+254" },
  { iso: "BR", name: "Brazil", flag: "🇧🇷", dial: "+55" },
  { iso: "MX", name: "Mexico", flag: "🇲🇽", dial: "+52" },
];

const DIALS_BY_LENGTH_DESC = [...new Set(COUNTRY_CODES.map((c) => c.dial))].sort((a, b) => b.length - a.length);

// Splits a stored value like "+971 501234567" (or a legacy plain number with
// no code) into { dial, number } so the two dropdown/input controls can be
// hydrated from a single string prop.
function splitValue(value: string): { dial: string; number: string } {
  const trimmed = value.trim();
  const matchedDial = DIALS_BY_LENGTH_DESC.find((dial) => trimmed.startsWith(dial));
  if (matchedDial) {
    return { dial: matchedDial, number: trimmed.slice(matchedDial.length).trim() };
  }
  return { dial: "+91", number: trimmed };
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = "50 123 4567",
  required,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const { dial, number } = useMemo(() => splitValue(value), [value]);
  const [localDial, setLocalDial] = useState(dial);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Keeps the select in sync if the incoming value's code changes out from
  // under us (e.g. admin edit form finishes loading an existing job).
  const effectiveDial = value ? dial : localDial;
  const effectiveCountry = COUNTRY_CODES.find((c) => c.dial === effectiveDial) ?? COUNTRY_CODES[0];

  const handleDialChange = (nextDial: string) => {
    setLocalDial(nextDial);
    onChange(number ? `${nextDial} ${number}` : nextDial === "+91" ? "" : "");
  };

  const handleNumberChange = (nextNumber: string) => {
    onChange(nextNumber ? `${effectiveDial} ${nextNumber}` : "");
  };

  return (
    <div className="flex gap-2">
      <Select.Root value={effectiveDial} onValueChange={(v) => handleDialChange(v as string)}>
        <Select.Trigger
          ref={triggerRef}
          aria-label="Country code"
          className="shrink-0 w-[92px] flex items-center justify-between gap-1 pl-2.5 pr-2 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
        >
          <span className="truncate">{effectiveCountry.flag} {effectiveCountry.dial}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner anchor={triggerRef} side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
            <Select.Popup className="w-56 max-h-72 overflow-auto rounded-xl border border-border/60 bg-white shadow-xl py-1.5">
              <Select.List>
                {COUNTRY_CODES.map((c) => (
                  <Select.Item
                    key={c.iso}
                    value={c.dial}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50"
                  >
                    <Select.ItemText className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </Select.ItemText>
                    <span className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      {c.dial}
                      <Select.ItemIndicator>
                        <Check className="w-3.5 h-3.5 text-brand-blue" />
                      </Select.ItemIndicator>
                    </span>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
        required={required}
      />
    </div>
  );
}
