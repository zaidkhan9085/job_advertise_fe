"use client";

import { useRef } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export interface SimpleSelectOption {
  value: string;
  label: string;
}

// A plain native <select>'s dropdown popup is rendered by the browser/OS
// itself, outside any CSS the page controls — it can open past the edge of
// short viewports, overlapping content it has no business overlapping (seen
// live on the ATS filter bar). This renders the popup in-page instead
// (Portal + Positioner anchored to the trigger, same proven pattern as
// PhoneInput.tsx's country-code select), so it behaves like every other
// dropdown on the page.
export default function SimpleSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SimpleSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  return (
    <Select.Root value={value} onValueChange={(v) => onChange(v as string)} disabled={disabled}>
      <Select.Trigger
        ref={triggerRef}
        className={
          (className ??
            "w-full flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl border border-border/60 bg-white focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium cursor-pointer") +
          " disabled:opacity-60 disabled:cursor-not-allowed"
        }
      >
        <span className={`truncate ${selected ? "" : "text-muted-foreground"}`}>{selected?.label ?? placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner anchor={triggerRef} side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
          <Select.Popup className="w-[var(--anchor-width)] max-h-64 overflow-auto rounded-xl border border-border/60 bg-white shadow-xl py-1.5">
            <Select.List>
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className="flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="w-3.5 h-3.5 text-brand-blue" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
