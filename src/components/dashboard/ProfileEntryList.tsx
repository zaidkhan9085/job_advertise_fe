"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileEntry } from "@/lib/api";

// Repeatable entry editor for Experience / Education / Projects — same
// shape convention as Resume builder's LIST section type (id/title/
// subtitle/date/content), reused here for the candidate profile itself.
export default function ProfileEntryList({
  entries,
  onChange,
  titlePlaceholder,
  subtitlePlaceholder,
  addLabel,
}: {
  entries: ProfileEntry[];
  onChange: (next: ProfileEntry[]) => void;
  titlePlaceholder: string;
  subtitlePlaceholder: string;
  addLabel: string;
}) {
  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:border-brand-blue outline-none transition-all text-sm font-medium";

  const updateEntry = (id: string, field: keyof ProfileEntry, value: string) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    onChange([...entries, { id: Date.now().toString(), title: "", subtitle: "", date: "", content: "" }]);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3 relative">
          <button
            type="button"
            onClick={() => removeEntry(entry.id)}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="grid sm:grid-cols-2 gap-3 pr-8">
            <input
              value={entry.title}
              onChange={(e) => updateEntry(entry.id, "title", e.target.value)}
              placeholder={titlePlaceholder}
              className={`${inputClass} font-bold`}
            />
            <input
              value={entry.subtitle}
              onChange={(e) => updateEntry(entry.id, "subtitle", e.target.value)}
              placeholder={subtitlePlaceholder}
              className={inputClass}
            />
          </div>
          <input
            value={entry.date}
            onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
            placeholder="e.g. Jan 2022 – Present"
            className={`${inputClass} sm:max-w-xs`}
          />
          <textarea
            value={entry.content}
            onChange={(e) => updateEntry(entry.id, "content", e.target.value)}
            placeholder="Key responsibilities, achievements, or details..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 rounded-xl border-2 border-dashed border-brand-blue/30 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}
