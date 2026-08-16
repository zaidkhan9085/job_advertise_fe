"use client";

import { useEffect, useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import { searchJobLocations, type JobPost, type JobLocationSearchResult } from "@/lib/api";

export type LocationValue = JobLocationSearchResult;

function formatLabel(loc: LocationValue) {
  return [loc.name, loc.state, loc.country].filter(Boolean).join(", ");
}

// A job counts toward a location if it's an exact match (job posted at
// exactly that city/state/country) or that location is one of the job's
// denormalized ancestors (e.g. a job posted in "Mumbai" counts toward a
// "Maharashtra" or "India" search result too).
function countJobsAt(jobs: JobPost[], locationId: string): number {
  let count = 0;
  for (const job of jobs) {
    if (job.jobLocationId === locationId || job.jobLocationCountryId === locationId || job.jobLocationStateId === locationId) {
      count++;
    }
  }
  return count;
}

// Naukri-style location filter: search-as-you-type over the full worldwide
// location tree, each result annotated with how many currently-loaded jobs
// are actually at that location — real counts, computed live, zero-count
// results simply don't appear (never a "0" or a dash placeholder).
export default function LocationCountFilter({
  label,
  placeholder = "Search city, state, or country...",
  selected,
  onChange,
  jobs,
}: {
  label: string;
  placeholder?: string;
  selected: LocationValue[];
  onChange: (next: LocationValue[]) => void;
  jobs: JobPost[];
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [rawResults, setRawResults] = useState<LocationValue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const term = inputValue.trim();
  const isSearchable = term.length >= 2;

  useEffect(() => {
    if (!isSearchable) return;
    const timer = setTimeout(() => {
      setIsLoading(true);
      searchJobLocations(term)
        .then(setRawResults)
        .catch(() => setRawResults([]))
        .finally(() => setIsLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [term, isSearchable]);

  // Real counts only, computed against the currently-loaded jobs — zero-
  // count matches are dropped entirely rather than shown as "0" or "-".
  const results = isSearchable
    ? rawResults
        .map((r) => ({ ...r, count: countJobsAt(jobs, r.id) }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];

  const visibleChip = selected[0];
  const overflowChips = selected.slice(1);

  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
      <Combobox.Root
        items={results}
        filter={null}
        multiple
        autoHighlight
        value={selected}
        onValueChange={(next) => onChange(next as LocationValue[])}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        isItemEqualToValue={(a, b) => a?.id === b?.id}
        itemToStringLabel={(item) => formatLabel(item)}
      >
        <div className="relative" ref={fieldRef}>
          <Combobox.Chips className="min-h-[44px] w-full flex flex-nowrap items-center gap-1.5 pl-3 pr-8 py-1.5 rounded-xl border-[1.5px] border-border bg-white shadow-sm hover:border-brand-blue/40 focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-brand-blue transition-all">
            {visibleChip && (
              <Combobox.Chip className="inline-flex items-center gap-1 bg-brand-blue-muted/60 text-brand-blue text-xs font-bold pl-2.5 pr-1 py-1 rounded-lg shrink-0 max-w-[65%]">
                <span className="truncate">{visibleChip.name}</span>
                <Combobox.ChipRemove className="p-0.5 rounded hover:bg-brand-blue/15 transition-colors shrink-0">
                  <X className="w-3 h-3" />
                </Combobox.ChipRemove>
              </Combobox.Chip>
            )}

            {overflowChips.length > 0 && (
              <div
                className="relative shrink-0"
                onMouseEnter={() => setOverflowOpen(true)}
                onMouseLeave={() => setOverflowOpen(false)}
              >
                <span className="inline-flex items-center bg-secondary text-foreground text-xs font-bold px-2 py-1 rounded-lg cursor-default">
                  +{overflowChips.length}
                </span>
                {overflowOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[180px] max-w-[260px] rounded-lg border border-border/60 bg-white shadow-lg p-2 flex flex-col gap-1">
                    {overflowChips.map((item) => (
                      <span key={item.id} className="text-xs font-semibold text-foreground leading-snug">
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Combobox.Input
              placeholder={selected.length ? "" : placeholder}
              className="flex-1 min-w-[50px] outline-none border-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground py-1"
            />
          </Combobox.Chips>
          {selected.length > 0 ? (
            <Combobox.Clear className="absolute right-2.5 top-[13px] p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5" />
            </Combobox.Clear>
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-[13px] pointer-events-none" />
          )}
        </div>

        <Combobox.Portal>
          <Combobox.Positioner anchor={fieldRef} side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
            <Combobox.Popup className="w-[var(--anchor-width)] max-h-72 overflow-auto rounded-xl border border-border/60 bg-white shadow-xl py-1.5">
              {isSearchable && isLoading ? (
                <div className="px-3.5 py-3 text-sm text-muted-foreground text-center">Searching...</div>
              ) : (
                <Combobox.Empty className="px-3.5 py-3 text-sm text-muted-foreground text-center">
                  {term.length < 2 ? "Type at least 2 characters" : "No jobs found in that location"}
                </Combobox.Empty>
              )}
              <Combobox.List>
                {(item: LocationValue & { count: number }) => (
                  <Combobox.Item
                    key={item.id}
                    value={item}
                    className="flex items-center justify-between gap-3 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50 data-[selected]:font-bold"
                  >
                    <span className="min-w-0">
                      <span className="truncate">{item.name}</span>
                      {(item.state || item.country) && (
                        <span className="text-muted-foreground font-normal ml-1">
                          · {[item.state, item.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-brand-blue tabular-nums">{item.count}</span>
                      <Combobox.ItemIndicator>
                        <Check className="w-4 h-4 text-brand-blue shrink-0" />
                      </Combobox.ItemIndicator>
                    </span>
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
