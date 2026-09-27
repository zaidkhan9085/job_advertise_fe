"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

export interface RowActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

// A small "..." menu for a table row's less-common actions, so the Actions
// column doesn't have to show every possible button at once. The trigger
// and panel both stop click propagation, so opening/using this never fires
// a parent row's onRowClick (see CommonTable).
export default function RowActionsMenu({ items }: { items: RowActionItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        title="More actions"
        onClick={() => setIsOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-border/60 bg-white shadow-lg py-1.5">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                item.danger ? "text-rose-600 hover:bg-rose-50" : "text-foreground hover:bg-secondary/60"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
