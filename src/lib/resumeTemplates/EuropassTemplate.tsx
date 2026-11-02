import { Mail, Phone, MapPin } from "lucide-react";
import type { TemplateContentProps, ListItem } from "./types";
import { formatDisplayDate } from "./formatDate";

// Now follows theme.color like every other color-customizable template --
// "Europass Blue" (#003399, the format's real official color) is just the
// first palette entry a candidate would naturally reach for, not hardcoded
// here. theme.color defaults to Signal Blue (#1098F0) for a brand-new
// resume, so a candidate who wants the authentic look picks "Europass
// Blue" from the color row same as any other choice.
export default function EuropassTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL" && s.type !== "LANGUAGES");
  const languagesSection = sections.find((s) => s.type === "LANGUAGES");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: theme.color }}>{section.title}</h2>
            <p className="text-[10px] leading-relaxed text-slate-700 whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }
      case "LIST": {
        const hasContent = section.items.some((i: ListItem) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: theme.color }}>{section.title}</h2>
            <div className="space-y-4">
              {section.items.filter((i) => i.title || i.subtitle).map((item) => (
                <div key={item.id} className="grid grid-cols-[90px_1fr] gap-3">
                  <span className="text-[9px] font-bold text-slate-400">{item.date}</span>
                  <div>
                    <h3 className="text-[10.5px] font-bold text-slate-900">{item.title}</h3>
                    <p className="text-[10px] font-semibold text-slate-600 mb-1">{item.subtitle}</p>
                    <p className="text-[9px] leading-relaxed text-slate-600 whitespace-pre-line">{item.content}</p>
                  </div>
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
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: theme.color }}>{section.title}</h2>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((t) => t).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 border border-slate-300 text-slate-700 text-[9px] font-bold rounded">{tag}</span>
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
      <header className="flex items-start justify-between gap-6 p-5 mb-7 text-white" style={{ backgroundColor: theme.color }}>
        <div>
          <h1 className="text-2xl font-black mb-1">{personal.fullName || "Your Full Name"}</h1>
          <p className="text-sm font-bold text-white/85 mb-3">{personal.jobTitle || "Your Professional Title"}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-semibold text-white/85">
            {personal.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{personal.email}</div>}
            {personal.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{personal.phone}</div>}
            {personal.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{personal.location}</div>}
          </div>
        </div>
        <div className="shrink-0 text-right text-[9px] font-black uppercase tracking-[0.2em] text-white/70 border border-white/30 rounded px-2 py-1">europass</div>
      </header>

      {(personal.dateOfBirth || personal.nationality) && (
        <section className="mb-6 text-[9px] font-semibold text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
          {personal.dateOfBirth && <span><span className="text-slate-400 uppercase tracking-wider">Date of Birth: </span>{formatDisplayDate(personal.dateOfBirth)}</span>}
          {personal.nationality && <span><span className="text-slate-400 uppercase tracking-wider">Nationality: </span>{personal.nationality}</span>}
        </section>
      )}

      <div>{otherSections.map((section) => renderSection(section))}</div>

      {languagesSection?.type === "LANGUAGES" && languagesSection.items.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: theme.color }}>{languagesSection.title || "Language Skills"}</h2>
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-left text-slate-400 uppercase tracking-wider text-[8px]">
                <th className="font-bold pb-1">Language</th>
                <th className="font-bold pb-1">CEFR Level</th>
              </tr>
            </thead>
            <tbody>
              {languagesSection.items.map((lang) => (
                <tr key={lang.id} className="border-t border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">{lang.language}</td>
                  <td className="py-1.5 font-black" style={{ color: theme.color }}>{lang.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
