import { Mail, Phone, MapPin } from "lucide-react";
import type { TemplateContentProps, ListItem } from "./types";
import { formatDisplayDate } from "./formatDate";

// Keywords matched against an experience entry's `subtitle` (company/
// entity) to split "Gulf Experience" from everything else -- adopting the
// sister site's Bio-Data-template technique (not its code): a simple,
// fully-automatic heuristic requiring no extra field from the candidate.
// Deliberately broad/lowercase-matched rather than an exhaustive gazetteer.
const GULF_KEYWORDS = [
  "uae", "u.a.e", "dubai", "abu dhabi", "sharjah", "ajman",
  "saudi", "ksa", "riyadh", "jeddah", "dammam",
  "qatar", "doha",
  "oman", "muscat",
  "bahrain", "manama",
  "kuwait",
  "gcc", "gulf",
];

function isGulfEntry(item: ListItem): boolean {
  const haystack = `${item.subtitle} ${item.content}`.toLowerCase();
  return GULF_KEYWORDS.some((kw) => haystack.includes(kw));
}

export default function GulfCvTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const otherSections = sections.filter((s) => s.type !== "PERSONAL" && s.id !== "experience");
  const experienceSection = sections.find((s) => s.type === "LIST" && s.id === "experience");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const personalDetails = [
    personal.dateOfBirth && { label: "Date of Birth", value: formatDisplayDate(personal.dateOfBirth) },
    personal.nationality && { label: "Nationality", value: personal.nationality },
    personal.gender && { label: "Gender", value: personal.gender },
    personal.passportNo && { label: "Passport No.", value: personal.passportNo },
  ].filter((x): x is { label: string; value: string } => !!x);

  const renderListItem = (item: ListItem) => (
    <div key={item.id} className="mb-4">
      <div className="flex justify-between items-baseline">
        <h3 className="text-[11px] font-black text-slate-900">{item.title}</h3>
        <span className="text-[9px] font-bold text-slate-400 italic">{item.date}</span>
      </div>
      <p className="text-[10px] font-bold mb-1" style={{ color: theme.color }}>{item.subtitle}</p>
      <p className="text-[9px] leading-relaxed text-slate-600 whitespace-pre-line">{item.content}</p>
    </div>
  );

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
        const hasContent = section.items.some((i) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
            {section.items.filter((i) => i.title || i.subtitle).map(renderListItem)}
          </section>
        );
      }
      case "TAGS": {
        const hasTags = section.items.some((t) => t);
        if (!hasTags) return null;
        return (
          <section key={section.id} className="mb-7">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
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
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>{section.title}</h2>
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

  const expItems = experienceSection?.type === "LIST" ? experienceSection.items.filter((i) => i.title || i.subtitle) : [];
  const gulfItems = expItems.filter(isGulfEntry);
  const otherItems = expItems.filter((i) => !isGulfEntry(i));

  return (
    <>
      <header className="pb-5 mb-6" style={{ borderBottom: `3px solid ${theme.color}` }}>
        <h1 className="text-3xl font-black text-slate-900 mb-1">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-lg font-bold mb-3" style={{ color: theme.color }}>{personal.jobTitle || "Your Professional Title"}</p>

        <div className="flex flex-wrap gap-y-1.5 gap-x-5 text-[10px] font-bold text-slate-500 mb-3">
          {personal.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" style={{ color: theme.color }} />{personal.email}</div>}
          {personal.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" style={{ color: theme.color }} />{personal.phone}</div>}
          {personal.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" style={{ color: theme.color }} />{personal.location}</div>}
        </div>

        {personalDetails.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[9px] font-semibold text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
            {personalDetails.map((d) => (
              <span key={d.label}>
                <span className="text-slate-400 uppercase tracking-wider">{d.label}: </span>{d.value}
              </span>
            ))}
          </div>
        )}
      </header>

      {expItems.length > 0 && (
        <section className="mb-7">
          <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
            {experienceSection?.title || "Work Experience"}
          </h2>
          {gulfItems.length > 0 && (
            <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Gulf Experience</p>
              {gulfItems.map(renderListItem)}
            </div>
          )}
          {otherItems.length > 0 && (
            <div>
              {gulfItems.length > 0 && <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Other Experience</p>}
              {otherItems.map(renderListItem)}
            </div>
          )}
        </section>
      )}

      <div>{otherSections.map((section) => renderSection(section))}</div>
    </>
  );
}
