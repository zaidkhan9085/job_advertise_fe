import type { TemplateContentProps, ListItem } from "./types";

// Traditional senior/C-level format -- centered serif header, small-caps
// section headings under a full-width rule, single column. Serif
// typography is the one deliberate override of theme.fontFamily in this
// template (same reasoning as Europass hardcoding its official blue):
// "Executive" is a recognized format defined partly BY its classic serif
// look (confirmed via industry research -- distinctive/traditional
// executive templates consistently use serif faces), so letting the
// builder's general sans-serif font bleed in here would undercut the
// format's whole identity.
const SERIF_STACK = "Georgia, 'Times New Roman', Times, serif";

export default function ExecutiveTemplate({ sections, theme }: TemplateContentProps) {
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
          <section key={section.id} className="mb-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-center mb-3 pb-2 border-b border-slate-300">{section.title}</h2>
            <p className="text-[10.5px] leading-relaxed text-slate-700 text-center whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }
      case "LIST": {
        const hasContent = section.items.some((i: ListItem) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-center mb-4 pb-2 border-b border-slate-300">{section.title}</h2>
            <div className="space-y-5">
              {section.items.filter((i) => i.title || i.subtitle).map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[11.5px] font-bold text-slate-900">{item.title}</h3>
                    <span className="text-[9.5px] italic text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-[10px] italic text-slate-600 mb-1.5">{item.subtitle}</p>
                  {item.content && <p className="text-[9.5px] leading-relaxed text-slate-700 whitespace-pre-line">{item.content}</p>}
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
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-center mb-3 pb-2 border-b border-slate-300">{section.title}</h2>
            <p className="text-[10px] text-slate-700 text-center leading-relaxed">{section.items.filter((t) => t).join("  •  ")}</p>
          </section>
        );
      }
      case "LANGUAGES": {
        if (section.items.length === 0) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-center mb-3 pb-2 border-b border-slate-300">{section.title || "Languages"}</h2>
            <p className="text-[10px] text-slate-700 text-center leading-relaxed">
              {section.items.map((l) => `${l.language} (${l.level})`).join("  •  ")}
            </p>
          </section>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: SERIF_STACK }}>
      <header className="text-center mb-8">
        <h1 className="text-[26px] font-bold tracking-[0.08em] uppercase text-slate-900 mb-1">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-[12px] italic tracking-wide mb-3" style={{ color: theme.color }}>{personal.jobTitle || "Your Professional Title"}</p>
        {contactParts.length > 0 && (
          <p className="text-[9.5px] text-slate-500 tracking-wide">{contactParts.join("   ·   ")}</p>
        )}
        <div className="mt-4 space-y-0.5">
          <div className="border-t-2" style={{ borderColor: theme.color }} />
          <div className="border-t" style={{ borderColor: theme.color, opacity: 0.4 }} />
        </div>
      </header>

      <div>{otherSections.map((section) => renderSection(section))}</div>
    </div>
  );
}
