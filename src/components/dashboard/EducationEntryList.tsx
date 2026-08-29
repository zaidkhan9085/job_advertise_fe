"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProfileEntry } from "@/lib/api";
import SearchableSelect from "@/components/common/SearchableSelect";
import { COURSE_OPTIONS, getSpecializationOptions } from "@/lib/courseSpecializations";

const COURSE_SELECT_OPTIONS = COURSE_OPTIONS.map((c) => ({ value: c, label: c }));

// Education-specific fork of ProfileEntryList (which stays exactly as-is for
// Experience/Projects) -- the free-text "course" input is replaced with two
// dependent dropdowns: Course, then Specialization filtered by whichever
// Course is picked. Institution/date/content stay plain text, same as
// before.
export default function EducationEntryList({
  entries,
  onChange,
}: {
  entries: ProfileEntry[];
  onChange: (next: ProfileEntry[]) => void;
}) {
  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:border-brand-blue outline-none transition-all text-sm font-medium";

  const updateEntry = (id: string, patch: Partial<ProfileEntry>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const addEntry = () => {
    onChange([...entries, { id: Date.now().toString(), title: "", subtitle: "", date: "", content: "", course: "", specialization: "" }]);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const course = entry.course ?? "";
        const specializationOptions = getSpecializationOptions(course).map((s) => ({ value: s, label: s }));
        // An entry saved before Course/Specialization existed has a
        // free-text title but no course yet -- surface the old text as a
        // hint instead of silently discarding it, but never auto-select a
        // guess from it.
        const legacyTitle = entry.title && !course ? entry.title : null;

        return (
          <div key={entry.id} className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3 relative">
            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="pr-8 space-y-3">
              {legacyTitle && (
                <p className="text-xs text-muted-foreground italic">Previously entered: &ldquo;{legacyTitle}&rdquo; — pick a course below to replace it.</p>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Course"
                  placeholder="Search and select a course..."
                  value={course}
                  onChange={(next) => updateEntry(entry.id, { course: next, specialization: "" })}
                  options={COURSE_SELECT_OPTIONS}
                />
                {course && course !== "Other" ? (
                  <SearchableSelect
                    label="Specialization"
                    placeholder="Search and select a specialization..."
                    value={entry.specialization ?? ""}
                    onChange={(next) => updateEntry(entry.id, { specialization: next })}
                    options={specializationOptions}
                  />
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Specialization</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-secondary/30 text-sm text-muted-foreground">
                      {course === "Other" ? "Not applicable" : "Select a course first"}
                    </div>
                  </div>
                )}
              </div>
              <input
                value={entry.subtitle}
                onChange={(e) => updateEntry(entry.id, { subtitle: e.target.value })}
                placeholder="School / institute"
                className={inputClass}
              />
              <input
                value={entry.date}
                onChange={(e) => updateEntry(entry.id, { date: e.target.value })}
                placeholder="e.g. Jan 2022 – Present"
                className={`${inputClass} sm:max-w-xs`}
              />
              <textarea
                value={entry.content}
                onChange={(e) => updateEntry(entry.id, { content: e.target.value })}
                placeholder="Key achievements or details..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addEntry}
        className="w-full py-3 rounded-xl border-2 border-dashed border-brand-blue/30 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
      >
        <Plus className="w-4 h-4" /> Add education
      </button>
    </div>
  );
}
