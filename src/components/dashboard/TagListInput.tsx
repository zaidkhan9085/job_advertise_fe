"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

// Free-text tag adder for string[] profile sections (Skills,
// Certifications) — type + Enter (or the + button) to add, click X to
// remove. Deliberately simpler than MultiSelectCombobox/CityAutocomplete:
// no search, no fixed option list, just free-form tags.
export default function TagListInput({
  values,
  onChange,
  placeholder = "Type and press Enter...",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!values.includes(trimmed)) onChange([...values, trimmed]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-secondary/30 border-2 border-transparent focus-within:border-brand-blue focus-within:bg-white transition-all min-h-[52px]">
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-white border border-border/60 rounded-lg pl-3 pr-1.5 py-1 text-xs font-bold text-foreground shadow-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== tag))}
              className="p-0.5 rounded hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={values.length ? "" : placeholder}
          className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm font-medium py-1"
        />
      </div>
      {draft.trim() && (
        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
        >
          <Plus className="w-3 h-3" /> Add &quot;{draft.trim()}&quot;
        </button>
      )}
    </div>
  );
}
