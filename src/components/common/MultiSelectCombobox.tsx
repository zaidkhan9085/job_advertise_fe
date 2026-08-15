"use client";

import { useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

export interface ComboOption {
  value: string;
  label: string;
  sublabel?: string;
}

export default function MultiSelectCombobox({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: {
  label: string;
  placeholder?: string;
  options: ComboOption[];
  selected: ComboOption[];
  onChange: (next: ComboOption[]) => void;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Beyond the first chip, collapse the rest into a "+N" badge — otherwise
  // a handful of long labels (e.g. full industry names) blow the field's
  // height out and break the row layout. Removal for anything beyond the
  // first chip happens via the popup list itself (already shows a check
  // for selected items), not an inline remove button per hidden chip.
  const visibleChip = selected[0];
  const overflowChips = selected.slice(1);

  return (
    <Combobox.Root
      items={options}
      multiple
      autoHighlight
      value={selected}
      onValueChange={(next) => onChange(next as ComboOption[])}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <div className="relative" ref={fieldRef}>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</label>
        <Combobox.Chips className="min-h-[44px] w-full flex flex-nowrap items-center gap-1.5 pl-3 pr-8 py-1.5 rounded-xl border-[1.5px] border-border bg-white shadow-sm hover:border-brand-blue/40 focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-brand-blue transition-all">
          {visibleChip && (
            <Combobox.Chip className="inline-flex items-center gap-1 bg-brand-blue-muted/60 text-brand-blue text-xs font-bold pl-2.5 pr-1 py-1 rounded-lg shrink-0 max-w-[65%]">
              <span className="truncate">{visibleChip.label}</span>
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
                    <span key={item.value} className="text-xs font-semibold text-foreground leading-snug">
                      {item.label}
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
          <Combobox.Clear className="absolute right-2.5 top-[38px] p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </Combobox.Clear>
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-[38px] pointer-events-none" />
        )}
      </div>

      <Combobox.Portal>
        <Combobox.Positioner anchor={fieldRef} side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-64 overflow-auto rounded-xl border border-border/60 bg-white shadow-xl py-1.5">
            <Combobox.Empty className="px-3.5 py-3 text-sm text-muted-foreground text-center">No matches</Combobox.Empty>
            <Combobox.List>
              {(item: ComboOption) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="flex items-center justify-between gap-2 px-3.5 py-2 text-sm font-medium text-foreground cursor-pointer data-[highlighted]:bg-brand-blue-muted/50 data-[selected]:font-bold"
                >
                  <span>
                    {item.label}
                    {item.sublabel && <span className="text-muted-foreground font-normal ml-1">· {item.sublabel}</span>}
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
  );
}
