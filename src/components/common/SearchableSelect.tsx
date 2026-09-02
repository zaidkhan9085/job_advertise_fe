"use client";

import { useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

// Single-select, search-as-you-type combobox over a small PRELOADED list
// (e.g. Industry, ~28 items now) — same idea as CityAutocomplete.tsx but
// without the async server search, since the whole list is already in
// memory (base-ui's own built-in filter handles narrowing it, no custom
// filter needed). Replaces a plain <select> for two real problems: (1) no
// search, awkward once a list has more than a handful of items, (2) a
// native <select>'s popup is rendered by the browser/OS itself, outside any
// CSS the page controls, and can overflow a short viewport — this renders
// in-page instead, height-capped and scrollable.
export default function SearchableSelect({
  label,
  placeholder = "Search and select...",
  value,
  onChange,
  options,
  required,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  required?: boolean;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((o) => o.value === value) ?? null;
  const [inputValue, setInputValue] = useState(selectedOption?.label ?? "");

  // Syncs inputValue when `value` changes out from under us (e.g. an edit
  // form finishes loading an existing record) — same pattern as
  // CityAutocomplete.tsx.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setInputValue(options.find((o) => o.value === value)?.label ?? "");
  }

  return (
    <div>
      {label && <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>}
      <Combobox.Root
        items={options}
        value={selectedOption}
        onValueChange={(next) => {
          const item = next as SearchableSelectOption | null;
          onChange(item?.value ?? "");
          setInputValue(item?.label ?? "");
        }}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringLabel={(item) => item.label}
      >
        <div className="relative" ref={fieldRef}>
          <Combobox.Input
            placeholder={placeholder}
            required={required}
            className="w-full pl-4 pr-9 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none text-sm font-medium truncate"
          />
          {selectedOption ? (
            <Combobox.Clear className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5" />
            </Combobox.Clear>
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        <Combobox.Portal>
          <Combobox.Positioner anchor={fieldRef} side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
            <Combobox.Popup className="w-[var(--anchor-width)] max-h-64 overflow-auto rounded-xl border border-border/60 bg-white shadow-xl py-1.5">
              <Combobox.Empty className="px-3.5 py-3 text-sm text-muted-foreground text-center">No matches</Combobox.Empty>
              <Combobox.List>
                {(item: SearchableSelectOption) => (
                  <Combobox.Item
                    key={item.value}
                    value={item}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50 data-[selected]:font-bold"
                  >
                    <span>{item.label}</span>
                    <Combobox.ItemIndicator>
                      <Check className="w-4 h-4 text-brand-blue shrink-0" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
