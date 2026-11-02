import type { TemplateContentProps, ListItem } from "./types";

// Deliberately restrained -- confirmed via industry research that
// "minimalist" as a genre means favoring content over decoration: no
// icons, no filled color blocks, light-weight type, thin hairline rules,
// generous whitespace. theme.color gets exactly one job here (the name),
// everything else stays monochrome so the format keeps its minimalist
// identity regardless of which color a candidate picks.
export default function MinimalistTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const contactParts = [personal.email, personal.phone, personal.location, personal.website?.replace(/^https?:\/\//, "")].filter(Boolean);

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2.5">{section.title}</h2>
            <p className="text-[10.5px] leading-relaxed text-slate-700 whitespace-pre-line font-light">{section.data.content}</p>
          </section>
        );
      }
      case "LIST": {
        const items = section.items.filter((i: ListItem) => i.title || i.subtitle);
        if (items.length === 0) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-4">{section.title}</h2>
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[11px] font-semibold text-slate-900">{item.title}</h3>
                    <span className="text-[9px] text-slate-400">{item.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1.5">{item.subtitle}</p>
                  {item.content && <p className="text-[9.5px] leading-relaxed text-slate-600 font-light whitespace-pre-line">{item.content}</p>}
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
          <section key={section.id} className="mb-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2.5">{section.title}</h2>
            <p className="text-[10px] text-slate-600 leading-relaxed">{section.items.filter((t) => t).join("   •   ")}</p>
          </section>
        );
      }
      case "LANGUAGES": {
        if (section.items.length === 0) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2.5">{section.title || "Languages"}</h2>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {section.items.map((l) => `${l.language} (${l.level})`).join("   •   ")}
            </p>
          </section>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      <header className="mb-10 pb-6 border-b border-slate-200">
        <h1 className="text-[28px] font-light tracking-tight mb-1" style={{ color: theme.color }}>{personal.fullName || "Your Full Name"}</h1>
        <p className="text-[12px] text-slate-500 font-light mb-3">{personal.jobTitle || "Your Professional Title"}</p>
        {contactParts.length > 0 && <p className="text-[9.5px] text-slate-400 tracking-wide">{contactParts.join("   ·   ")}</p>}
      </header>

      <div>{otherSections.map((section) => renderSection(section))}</div>
    </div>
  );
}
