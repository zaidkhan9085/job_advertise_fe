"use client";

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
  CircleHelp,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import PhoneInput from "@/components/common/PhoneInput";

interface SortableSectionProps {
  section: any;
  onUpdate: (data: any) => void;
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
      default: return <CircleHelp className="w-5 h-5" />;
    }
  };

  const renderContent = () => {
    switch (section.type) {
      case "PERSONAL":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Full Name", key: "fullName", placeholder: "e.g. John Doe" },
              { label: "Job Title", key: "jobTitle", placeholder: "e.g. Lead Designer" },
              { label: "Email", key: "email", placeholder: "e.g. john@example.com" },
              { label: "Phone", key: "phone", placeholder: "e.g. +1 234 567 890" },
              { label: "Location", key: "location", placeholder: "e.g. Dubai, UAE" },
              { label: "Website", key: "website", placeholder: "e.g. https://portfolio.com" },
            ].map(f => (
              <div key={f.key} className="space-y-1.5 focus-within:translate-x-1 transition-transform duration-200">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{f.label}</label>
                {f.key === "phone" ? (
                  <PhoneInput
                    value={section.data[f.key]}
                    onChange={(v) => onUpdate({ ...section, data: { ...section.data, [f.key]: v } })}
                  />
                ) : (
                  <input
                    type="text"
                    value={section.data[f.key]}
                    autoComplete="off"
                    onChange={(e) => onUpdate({ ...section, data: { ...section.data, [f.key]: e.target.value } })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border-2 border-slate-300 focus:border-brand-blue/30 focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 placeholder:text-slate-500 shadow-inner"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case "SUMMARY":
        return (
          <div className="space-y-2">
            <textarea 
              rows={6}
              value={section.data.content}
              onChange={(e) => onUpdate({ ...section, data: { ...section.data, content: e.target.value } })}
              placeholder="Elevate your profile with a powerful career summary..."
              className="w-full px-5 py-4 rounded-2xl bg-slate-100/50 border-2 border-slate-300 focus:border-brand-blue/30 focus:bg-white transition-all outline-none font-medium text-sm text-slate-800 placeholder:text-slate-500 resize-none leading-relaxed shadow-inner"
            />
          </div>
        );

      case "LIST":
        return (
          <div className="space-y-6">
            {section.items.map((item: any, idx: number) => (
              <div key={item.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group/item hover:border-brand-blue/20 hover:bg-white transition-all duration-300">
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
                          const newItems = section.items.filter((i: any) => i.id !== item.id);
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
                      placeholder="Date Range"
                      value={item.date}
                      onChange={(e) => {
                        const newItems = [...section.items];
                        newItems[idx] = { ...item, date: e.target.value };
                        onUpdate({ ...section, items: newItems });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-transparent border-b-2 border-slate-300 focus:border-brand-blue outline-none font-bold text-[10px] text-slate-600 placeholder:text-slate-400 uppercase tracking-widest text-right"
                    />
                    <div className="md:col-span-2">
                       <textarea 
                        rows={3}
                        placeholder="Key responsibilities or highlights..."
                        value={item.content}
                        onChange={(e) => {
                          const newItems = [...section.items];
                          newItems[idx] = { ...item, content: e.target.value };
                          onUpdate({ ...section, items: newItems });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-100/30 focus:bg-white border-2 border-slate-200 focus:border-brand-blue/20 outline-none font-medium text-[11px] text-slate-700 placeholder:text-slate-400 resize-none transition-all shadow-inner"
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
             <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                {section.items.map((tag: string, idx: number) => (
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
                      const newItems = section.items.filter((_: any, i: number) => i !== idx);
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

      default:
        return <div className="p-4 text-xs font-bold text-slate-400 uppercase italic">Custom section logic goes here...</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group/section bg-white rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
        section.isExpanded ? "border-slate-200 shadow-[0_20px_60px_-15px_rgba(30,58,138,0.05)]" : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center px-4 py-3">
         {/* Reorder Handle */}
         <div 
           {...attributes} 
           {...listeners} 
           className="p-3 cursor-grab active:cursor-grabbing text-slate-300 hover:text-brand-blue transition-colors"
         >
           <GripVertical className="w-4 h-4" />
         </div>

         {/* Section Header */}
         <button 
           onClick={onToggle}
           className="flex-1 flex items-center gap-4 py-4 px-2 text-left group"
         >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              section.isExpanded ? "bg-brand-blue text-white shadow-brand-blue/20" : "bg-slate-100 text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue shadow-none"
            }`}>
              {getIcon(section.type)}
            </div>
            <div className="flex-1">
               <h3 className={`text-[12px] font-black uppercase tracking-[0.15em] transition-colors ${section.isExpanded ? "text-slate-900" : "text-slate-500"}`}>
                 {section.title}
               </h3>
               {!section.isExpanded && <p className="text-[10px] font-bold text-slate-300 truncate mt-0.5 uppercase tracking-tighter">Click to expand and edit details</p>}
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-500 ${section.isExpanded ? "rotate-180" : ""}`} />
         </button>

         {/* Actions */}
         <div className={`flex items-center gap-1 pr-4 transition-all duration-500 ${section.isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
            <button onClick={onDuplicate} title="Duplicate Section" className="p-2.5 rounded-xl hover:bg-brand-blue/5 text-slate-300 hover:text-brand-blue transition-all">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onDelete} title="Delete Section" className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Expandable Content Area */}
      {section.isExpanded && (
        <div className="px-8 pb-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
           <div className="border-t border-slate-100 pt-8">
              {renderContent()}
           </div>
        </div>
      )}
    </div>
  );
}
