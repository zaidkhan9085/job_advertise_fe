"use client";

import { useEffect, useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, MapPin, X } from "lucide-react";
import { searchJobLocations, type JobLocationSearchResult, type JobLocationRef } from "@/lib/api";

export type LocationValue = JobLocationSearchResult;

function formatLabel(loc: LocationValue) {
  return [loc.name, loc.state, loc.country].filter(Boolean).join(", ");
}

// Converts a Prisma-`include`-shaped JobLocation (e.g. Company.jobLocation,
// CandidateProfile.jobLocation) into the shape this component expects —
// for hydrating the picker from an already-saved value.
export function toLocationValue(ref: JobLocationRef | null | undefined): LocationValue | null {
  if (!ref) return null;
  return { id: ref.id, name: ref.name, country: ref.countryName, state: ref.stateName };
}

// Async, single-select, server-searched location picker — the worldwide
// City/State/Country equivalent of MultiSelectCombobox.tsx (which is
// multi-select over a small preloaded list; this searches a tree with tens
// of thousands of rows, so it can't preload). Non-leaf nodes (e.g. "India"
// itself) come back from the search endpoint like any other row, so
// someone who doesn't want to pick an exact city isn't forced to.
export default function CityAutocomplete({
  label,
  placeholder = "Search city, state, or country...",
  value,
  onChange,
  required,
}: {
  label?: string;
  placeholder?: string;
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  required?: boolean;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value ? formatLabel(value) : "");
  const [results, setResults] = useState<LocationValue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Syncs inputValue when `value` changes out from under us (e.g. an edit
  // form finishes loading an existing record) — adjusted during render
  // rather than in an effect, per React's guidance for this exact case
  // (derived state from a prop), so it doesn't cost an extra render pass.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setInputValue(value ? formatLabel(value) : "");
  }

  const term = inputValue.trim();
  const isSearchable = term.length >= 2 && !(value && formatLabel(value) === term);

  useEffect(() => {
    if (!isSearchable) return;
    const timer = setTimeout(() => {
      setIsLoading(true);
      searchJobLocations(term)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [term, isSearchable]);

  const displayedResults = isSearchable ? results : [];

  return (
    <div>
      {label && <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>}
      <Combobox.Root
        items={displayedResults}
        filter={null}
        value={value}
        onValueChange={(next) => onChange(next)}
        inputValue={inputValue}
        onInputValueChange={(next) => setInputValue(next)}
        isItemEqualToValue={(a, b) => a?.id === b?.id}
        itemToStringLabel={(item) => formatLabel(item)}
      >
        <div className="relative" ref={fieldRef}>
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Combobox.Input
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-9 py-3 rounded-xl border-[1.5px] border-border bg-white shadow-sm hover:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm font-medium"
          />
          {value ? (
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
              {isSearchable && isLoading ? (
                <div className="px-3.5 py-3 text-sm text-muted-foreground text-center">Searching...</div>
              ) : (
                <Combobox.Empty className="px-3.5 py-3 text-sm text-muted-foreground text-center">
                  {term.length < 2 ? "Type at least 2 characters" : "No matches"}
                </Combobox.Empty>
              )}
              <Combobox.List>
                {(item: LocationValue) => (
                  <Combobox.Item
                    key={item.id}
                    value={item}
                    className="flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50 data-[selected]:font-bold"
                  >
                    <span>
                      {item.name}
                      {(item.state || item.country) && (
                        <span className="text-muted-foreground font-normal ml-1">
                          · {[item.state, item.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
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
