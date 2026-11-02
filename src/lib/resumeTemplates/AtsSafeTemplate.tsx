import type { TemplateContentProps, ListItem } from "./types";

// Deliberately plain: black text, no color, no icons, single column, plain
// section headers. This is the one template actually labeled "ATS-Safe" in
// the picker -- per research, decorative elements (icons, color blocks,
// multi-column layouts) are what applicant-tracking-system parsers most
// often mis-read or drop, so this template avoids all of them rather than
// trading a little safety for style like the other three do.
export default function AtsSafeTemplate({ sections }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const contactLine = [personal.email, personal.phone, personal.location, personal.website]
    .filter(Boolean)
    .join("  |  ");

  const renderSection = (section: (typeof sections)[number]) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">{section.title}</h2>
            <p className="text-[10px] leading-relaxed whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }

      case "LIST": {
        const hasContent = section.items.some((i: ListItem) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-3 border-b border-black pb-1">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map(
                (item) =>
                  (item.title || item.subtitle) && (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-[10.5px] font-bold">{item.title}</h3>
                        <span className="text-[9px] font-medium">{item.date}</span>
                      </div>
                      <p className="text-[10px] font-semibold mb-1">{item.subtitle}</p>
                      <p className="text-[9px] leading-relaxed whitespace-pre-line">{item.content}</p>
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
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">{section.title}</h2>
            <p className="text-[10px] leading-relaxed">{section.items.filter((t) => t).join("  ·  ")}</p>
          </section>
        );
      }

      case "LANGUAGES": {
        if (section.items.length === 0) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">{section.title}</h2>
            <p className="text-[10px] leading-relaxed">
              {section.items.map((l) => `${l.language} (${l.level})`).join("  ·  ")}
            </p>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <header className="pb-4 mb-6 border-b-2 border-black">
        <h1 className="text-2xl font-bold">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-sm font-semibold mb-2">{personal.jobTitle || "Your Professional Title"}</p>
        {contactLine && <p className="text-[10px]">{contactLine}</p>}
      </header>

      <div>{otherSections.map((section) => renderSection(section))}</div>
    </>
  );
}
