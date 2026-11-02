import { Mail, Phone, MapPin, Globe } from "lucide-react";
import type { TemplateContentProps, ListItem } from "./types";

// Single column, Modern-shaped, EXCEPT each LIST section (Experience/
// Education/Projects) renders as a vertical line with a dot per entry --
// a recognized resume pattern for visually emphasizing career progression
// (confirmed via industry research), not something any other template here
// does. Everything that isn't a LIST section renders exactly like Modern,
// so the timeline treatment reads as a genuine variation, not a reskin.
export default function TimelineTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
            <p className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }
      case "LIST": {
        const items = section.items.filter((i: ListItem) => i.title || i.subtitle);
        if (items.length === 0) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
            <div className="relative pl-5 border-l-2 space-y-6" style={{ borderColor: `${theme.color}40` }}>
              {items.map((item) => (
                <div key={item.id} className="relative">
                  <span
                    className="absolute -left-[26px] top-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: theme.color, boxShadow: `0 0 0 2px ${theme.color}` }}
                  />
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[11px] font-black text-slate-900">{item.title}</h3>
                    <span className="text-[9px] font-bold text-slate-400 italic">{item.date}</span>
                  </div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: theme.color }}>{item.subtitle}</p>
                  {item.content && <p className="text-[9px] leading-relaxed text-slate-600 whitespace-pre-line">{item.content}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      }
      case "TAGS": {
        const hasTags = section.items.some((t) => t);
        if (!hasTags) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((t) => t).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          </section>
        );
      }
      case "LANGUAGES": {
        if (section.items.length === 0) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title || "Languages"}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {section.items.map((lang) => (
                <span key={lang.id} className="text-[10px] font-bold text-slate-600">{lang.language} <span style={{ color: theme.color }}>· {lang.level}</span></span>
              ))}
            </div>
          </section>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <header className="border-b-4 pb-6 mb-8" style={{ borderColor: theme.color }}>
        <h1 className="text-3xl font-black text-slate-900 mb-1">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-lg font-bold mb-3" style={{ color: theme.color }}>{personal.jobTitle || "Your Professional Title"}</p>
        <div className="flex flex-wrap gap-y-1.5 gap-x-5 text-[10px] font-bold text-slate-500">
          {personal.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" style={{ color: theme.color }} />{personal.email}</div>}
          {personal.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" style={{ color: theme.color }} />{personal.phone}</div>}
          {personal.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" style={{ color: theme.color }} />{personal.location}</div>}
          {personal.website && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" style={{ color: theme.color }} />{personal.website.replace(/^https?:\/\//, "")}</div>}
        </div>
      </header>

      <div>{otherSections.map((section) => renderSection(section))}</div>
    </>
  );
}
