import { Mail, Phone, MapPin, Globe } from "lucide-react";
import type { TemplateContentProps, ListItem } from "./types";

// A direct, typed port of the Resume Builder's original (and, until now,
// only) design -- kept pixel-identical on purpose. Any resume saved before
// templates existed has `template: null`, falls back to this component via
// "signal-blue" (the exact original #1098F0 default), and must look
// unchanged for every existing saved resume.
export default function ModernTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <p className="text-[10px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }

      case "LIST": {
        const hasContent = section.items.some((i: ListItem) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.items.map(
                (item) =>
                  (item.title || item.subtitle) && (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase">{item.title}</h3>
                        <span className="text-[9px] font-bold text-slate-400 italic">{item.date}</span>
                      </div>
                      <p className="text-[10px] font-bold mb-2" style={{ color: theme.color }}>{item.subtitle}</p>
                      <p className="text-[9px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">{item.content}</p>
                    </div>
                  )
              )}
            </div>
          </section>
        );
      }

      case "TAGS": {
        const hasTags = section.items.some((t) => t);
        if (!hasTags) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((t) => t).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        );
      }

      case "LANGUAGES": {
        if (section.items.length === 0) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {section.items.map((lang) => (
                <span key={lang.id} className="text-[10px] font-bold text-slate-600">
                  {lang.language} <span style={{ color: theme.color }}>· {lang.level}</span>
                </span>
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
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: theme.color }}>{personal.jobTitle || "Your Professional Title"}</p>

        <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {personal.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.email}
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.phone}
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.location}
            </div>
          )}
          {personal.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.website.replace(/^https?:\/\//, "")}
            </div>
          )}
        </div>
      </header>

      <div className="space-y-2">{otherSections.map((section) => renderSection(section))}</div>
    </>
  );
}
