"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { JobLocation } from "@/lib/api";

export default function LocationPicker({
  locations,
  selectedLabel,
  onSelect,
}: {
  locations: JobLocation[];
  selectedLabel: string | null;
  onSelect: (id: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-left"
      >
        <span className={selectedLabel ? "text-foreground" : "text-muted-foreground"}>
          {selectedLabel || "Select Location"}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-60 bg-white rounded-xl border border-border/60 shadow-lg max-h-72 overflow-y-auto">
          {locations.map((top) => (
            <div key={top.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (top.children.length === 0) {
                    onSelect(top.id, top.name);
                    setOpen(false);
                    setExpandedId(null);
                  } else {
                    setExpandedId(expandedId === top.id ? null : top.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-left transition-colors ${
                  expandedId === top.id ? "bg-brand-blue text-white" : "text-foreground hover:bg-secondary/60"
                }`}
              >
                {top.name}
                {top.children.length > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {expandedId === top.id && top.children.length > 0 && (
                <div className="bg-secondary/20 border-y border-border/40">
                  {top.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        onSelect(child.id, child.name);
                        setOpen(false);
                        setExpandedId(null);
                      }}
                      className="w-full text-left px-8 py-2 text-sm font-medium text-foreground/80 hover:bg-white hover:text-brand-blue transition-colors"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
