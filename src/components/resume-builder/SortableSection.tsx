"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  Trash2,
  Copy,
  Plus,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Layers,
  Award,
  Languages as LanguagesIcon,
  CircleHelp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import PhoneInput from "@/components/common/PhoneInput";
import { polishResumeText, ApiError } from "@/lib/api";
import type { ResumeSection, CefrLevel } from "@/lib/resumeTemplates/types";

const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Shared, compact field style for every plain text input across the
// builder -- a single white background + thin border, not the earlier
// heavy pill (bg-slate-100/50, border-2, shadow-inner) that read as
// oversized/boxy next to the rest of the form.
const FIELD_CLASS =
  "w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all outline-none font-semibold text-sm text-slate-900 placeholder:text-slate-400";

// "Polish with AI" button shared by the Summary textarea and each list
// item's content textarea -- review-only (the parent decides how to apply
// `polished`), same pattern as the profile-import/resume-parse flows: AI
// output is always something the candidate reviews, never a silent
// overwrite that bypasses what they explicitly see happen. Owns its own
// busy state so each instance (one per list item, plus one for Summary)
// tracks its own in-flight request independently.
function PolishButton({ text, kind, onPolished, className }: { text: string; kind: "summary" | "bullet"; onPolished: (polished: string) => void; className?: string }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!text.trim()) {
      toast.error("Write something first, then polish it.");
      return;
    }
    setBusy(true);
    try {
      const { polished } = await polishResumeText({ text, kind });
      onPolished(polished);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't polish this right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-brand-blue hover:text-brand-blue-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className || "text-[10px]"}`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {busy ? "Polishing..." : "Polish with AI"}
    </button>
  );
}

interface SortableSectionProps {
  section: ResumeSection;
  onUpdate: (section: ResumeSection) => void;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function SortableSection({ section, onUpdate, onToggle, onDelete, onDuplicate }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PERSONAL": return <User className="w-5 h-5" />;
      case "SUMMARY": return <FileText className="w-5 h-5" />;
      case "LIST": return section.id === "education" ? <GraduationCap className="w-5 h-5" /> : section.id === "projects" ? <Layers className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />;
      case "TAGS": return section.id === "certifications" ? <Award className="w-5 h-5" /> : <Wrench className="w-5 h-5" />;
      case "LANGUAGES": return <LanguagesIcon className="w-5 h-5" />;
      default: return <CircleHelp className="w-5 h-5" />;
    }
  };

  const renderContent = () => {
    switch (section.type) {
      case "PERSONAL": {
        const personalSection = section;
        const fields: { label: string; key: keyof typeof personalSection.data; placeholder: string; optional?: boolean }[] = [
          { label: "Full Name", key: "fullName", placeholder: "e.g. John Doe" },
          { label: "Job Title", key: "jobTitle", placeholder: "e.g. Lead Designer" },
          { label: "Email", key: "email", placeholder: "e.g. john@example.com" },
          { label: "Phone", key: "phone", placeholder: "e.g. +1 234 567 890" },
          { label: "Location", key: "location", placeholder: "e.g. Dubai, UAE" },
          { label: "Website", key: "website", placeholder: "e.g. https://portfolio.com" },
        ];
        const optionalFields: { label: string; key: keyof typeof personalSection.data; placeholder: string }[] = [
          { label: "Date of Birth", key: "dateOfBirth", placeholder: "e.g. 14 Mar 1991" },
          { label: "Nationality", key: "nationality", placeholder: "e.g. Indian" },
          { label: "Gender", key: "gender", placeholder: "e.g. Female" },
          { label: "Passport No.", key: "passportNo", placeholder: "Optional — leave blank if unsure" },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map(f => (
                <div key={f.key} className="space-y-1.5 focus-within:translate-x-1 transition-transform duration-200">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{f.label}</label>
                  {f.key === "phone" ? (
                    <PhoneInput
                      value={personalSection.data.phone}
                      onChange={(v) => onUpdate({ ...personalSection, data: { ...personalSection.data, phone: v } })}
                    />
                  ) : (
                    <input
                      type="text"
                      value={personalSection.data[f.key] || ""}
                      autoComplete="off"
                      onChange={(e) => onUpdate({ ...personalSection, data: { ...personalSection.data, [f.key]: e.target.value } })}
                      placeholder={f.placeholder}
                      className={FIELD_CLASS}
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Optional — for Gulf CV / Europass templates</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {optionalFields.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{f.label}</label>
                    {f.key === "dateOfBirth" ? (
                      <input
                        type="date"
                        value={personalSection.data.dateOfBirth || ""}
                        onChange={(e) => onUpdate({ ...personalSection, data: { ...personalSection.data, dateOfBirth: e.target.value } })}
                        className={FIELD_CLASS}
                      />
                    ) : (
                      <input
                        type="text"
                        value={personalSection.data[f.key] || ""}
                        autoComplete="off"
                        onChange={(e) => onUpdate({ ...personalSection, data: { ...personalSection.data, [f.key]: e.target.value } })}
                        placeholder={f.placeholder}
                        className={FIELD_CLASS}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "SUMMARY":
        return (
          <div className="space-y-2.5">
            <textarea
              rows={6}
              value={section.data.content}
              onChange={(e) => onUpdate({ ...section, data: { ...section.data, content: e.target.value } })}
              placeholder="Elevate your profile with a powerful career summary..."
              className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all outline-none font-medium text-sm text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed"
            />
            <PolishButton
              text={section.data.content}
              kind="summary"
              onPolished={(polished) => onUpdate({ ...section, data: { ...section.data, content: polished } })}
            />
          </div>
        );

      case "LIST":
        return (
          <div className="space-y-6">
            {section.items.map((item, idx) => (
              <div key={item.id} className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative group/item hover:border-brand-blue/20 hover:bg-white transition-all duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Title / Position"
                      value={item.title}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, title: e.target.value };
                        onUpdate({ ...section, items: newItems });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-transparent border-b-2 border-slate-300 focus:border-brand-blue outline-none font-bold text-sm placeholder:text-slate-500 text-slate-900"
                    />
                    <div className="flex justify-end gap-1 opacity-20 group-hover/item:opacity-100 transition-opacity">
                       <button onClick={() => {
                          if (idx === 0) return;
                          const newItems = [...section.items];
                          [newItems[idx], newItems[idx-1]] = [newItems[idx-1], newItems[idx]];
                          onUpdate({ ...section, items: newItems });
                       }} className="p-1.5 hover:bg-slate-200 rounded-md"><ArrowUp className="w-3.5 h-3.5"/></button>
                       <button onClick={() => {
                          const newItems = section.items.filter((i) => i.id !== item.id);
                          onUpdate({ ...section, items: newItems });
                       }} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-md"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                    <input
                      placeholder="Subtitle / Entity"
                      value={item.subtitle}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, subtitle: e.target.value };
                        onUpdate({ ...section, items: newItems });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-transparent border-b-2 border-slate-300 focus:border-brand-blue outline-none font-bold text-xs text-brand-blue placeholder:text-brand-blue/40"
                    />
                    <input
                      placeholder="Date Range, e.g. Jan 2022 - Present"
                      value={item.date}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, date: e.target.value };
                        onUpdate({ ...section, items: newItems });
                      }}
                      className="md:col-span-2 w-full px-3 py-2 rounded-lg bg-transparent border-b-2 border-slate-300 focus:border-brand-blue outline-none font-bold text-xs text-slate-600 placeholder:text-slate-400"
                    />
                    <div className="md:col-span-2 space-y-1.5">
                       <textarea
                        rows={3}
                        placeholder="Key responsibilities or highlights..."
                        value={item.content}
                        onChange={(e) => {
                          const newItems = [...section.items];
                          newItems[idx] = { ...item, content: e.target.value };
                          onUpdate({ ...section, items: newItems });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-medium text-[11px] text-slate-700 placeholder:text-slate-400 resize-none transition-all"
                       />
                       <PolishButton
                         text={item.content}
                         kind="bullet"
                         className="text-[9px]"
                         onPolished={(polished) => {
                           const newItems = [...section.items];
                           newItems[idx] = { ...item, content: polished };
                           onUpdate({ ...section, items: newItems });
                         }}
                       />
                    </div>
                 </div>
              </div>
            ))}
            <button 
              onClick={() => onUpdate({ ...section, lastId: section.lastId+1, items: [...section.items, { id: (section.lastId+1).toString(), title: "", subtitle: "", date: "", content: "" }] })}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Entry
            </button>
          </div>
        );

      case "TAGS":
        return (
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                {section.items.map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-bold text-slate-700 transition-all hover:border-brand-blue/40">
                    <input
                      value={tag}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = e.target.value;
                        onUpdate({ ...section, items: newItems });
                      }}
                      className="bg-transparent outline-none w-[100px] text-xs font-black uppercase tracking-tight"
                    />
                    <button onClick={() => {
                      const newItems = section.items.filter((_, i) => i !== idx);
                      onUpdate({ ...section, items: newItems });
                    }} className="p-0.5 hover:bg-rose-50 text-rose-500 rounded">
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onUpdate({ ...section, items: [...section.items, ""] })}
                  className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>
          </div>
        );

      case "LANGUAGES":
        return (
          <div className="space-y-4">
            {section.items.map((lang, idx) => (
              <div key={lang.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input
                  placeholder="Language, e.g. French"
                  value={lang.language}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[idx] = { ...lang, language: e.target.value };
                    onUpdate({ ...section, items: newItems });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-bold text-sm text-slate-900 placeholder:text-slate-400 transition-all"
                />
                <select
                  value={lang.level}
                  onChange={(e) => {
                    const newItems = [...section.items];
                    newItems[idx] = { ...lang, level: e.target.value as CefrLevel };
                    onUpdate({ ...section, items: newItems });
                  }}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-black text-sm text-brand-blue transition-all"
                >
                  {CEFR_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
                <button
                  onClick={() => onUpdate({ ...section, items: section.items.filter((i) => i.id !== lang.id) })}
                  className="p-2 hover:bg-rose-50 text-rose-500 rounded-md shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onUpdate({ ...section, lastId: section.lastId + 1, items: [...section.items, { id: (section.lastId + 1).toString(), language: "", level: "B1" as CefrLevel }] })}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Language
            </button>
          </div>
        );

      default:
        return <div className="p-4 text-xs font-bold text-slate-400 uppercase italic">Custom section logic goes here...</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group/section bg-white rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
        section.isExpanded ? "border-slate-200 shadow-[0_20px_60px_-15px_rgba(16,152,240,0.05)]" : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center px-2 sm:px-4 py-3">
         {/* Reorder Handle */}
         <div
           {...attributes}
           {...listeners}
           className="p-2 sm:p-3 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-brand-blue transition-colors"
         >
           <GripVertical className="w-4 h-4" />
         </div>

         {/* Section Header -- min-w-0 on the flex children + truncate on
             the title is what keeps this row from wrapping to 2 lines on
             narrow screens (the default flex child min-width is `auto`,
             which ignores overflow and pushes the fixed-width actions
             on the right past the screen edge instead of truncating). */}
         <button
           onClick={onToggle}
           className="flex-1 min-w-0 flex items-center gap-2 sm:gap-4 py-4 px-1 sm:px-2 text-left group"
         >
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-lg ${
              section.isExpanded ? "bg-brand-gradient text-white shadow-brand-blue/25" : "bg-slate-100 text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue shadow-none"
            }`}>
              {getIcon(section.type)}
            </div>
            <div className="flex-1 min-w-0">
               <h3 className={`text-[11px] sm:text-[12px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] truncate transition-colors ${section.isExpanded ? "text-slate-900" : "text-slate-500"}`}>
                 {section.title}
               </h3>
               {!section.isExpanded && <p className="hidden sm:block text-[10px] font-bold text-slate-300 truncate mt-0.5 uppercase tracking-tighter">Click to expand and edit details</p>}
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-300 shrink-0 transition-transform duration-500 ${section.isExpanded ? "rotate-180" : ""}`} />
         </button>

         {/* Actions */}
         <div className={`flex items-center gap-0.5 sm:gap-1 pr-1 sm:pr-4 shrink-0 transition-all duration-500 ${section.isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
            <button onClick={onDuplicate} title="Duplicate Section" className="p-2 sm:p-2.5 rounded-xl hover:bg-brand-blue/5 text-slate-300 hover:text-brand-blue transition-all">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onDelete} title="Delete Section" className="p-2 sm:p-2.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Expandable Content Area */}
      {section.isExpanded && (
        <div className="px-4 sm:px-8 pb-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
           <div className="border-t border-slate-100 pt-8">
              {renderContent()}
           </div>
        </div>
      )}
    </div>
  );
}
