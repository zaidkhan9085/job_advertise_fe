import { Mail, Phone, MapPin, Globe } from "lucide-react";
import type { TemplateContentProps, ListItem, ResumeSection } from "./types";
import { formatDisplayDate } from "./formatDate";

// A genuinely two-column layout -- a colored sidebar carrying identity/
// contact/skills/languages, main content carrying the narrative sections
// (summary, experience, education, projects, certifications). Built from
// scratch around our own section model, not a port of any specific
// reference design -- no profile-photo upload exists in this builder, so
// the sidebar uses an initials avatar instead of an image slot.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function SidebarTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const skillsSection = sections.find((s) => s.type === "TAGS" && s.id === "skills");
  const languagesSection = sections.find((s) => s.type === "LANGUAGES");
  const mainSections = sections.filter(
    (s) => s.type !== "PERSONAL" && s !== skillsSection && s.type !== "LANGUAGES"
  );

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const personalDetails = [
    personal.dateOfBirth && { label: "Date of Birth", value: formatDisplayDate(personal.dateOfBirth) },
    personal.nationality && { label: "Nationality", value: personal.nationality },
    personal.passportNo && { label: "Passport No.", value: personal.passportNo },
  ].filter((x): x is { label: string; value: string } => !!x);

  const renderMainSection = (section: ResumeSection) => {
    switch (section.type) {
      case "SUMMARY": {
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: theme.color }}>{section.title}</h2>
            <p className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-line">{section.data.content}</p>
          </section>
        );
      }
      case "LIST": {
        const hasContent = section.items.some((i: ListItem) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: theme.color }}>{section.title}</h2>
            <div className="space-y-4">
              {section.items.filter((i) => i.title || i.subtitle).map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline gap-3">
                    <h3 className="text-[11px] font-black text-slate-900">{item.title}</h3>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{item.date}</span>
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
          <section key={section.id} className="mb-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: theme.color }}>{section.title}</h2>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((t) => t).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase tracking-wider">{tag}</span>
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
    <div className="grid grid-cols-[32%_68%] -m-[15mm] min-h-[297mm]">
      {/* Sidebar */}
      <aside className="text-white p-[15mm] pr-6" style={{ backgroundColor: theme.color }}>
        <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center text-lg font-black mb-4">
          {initials(personal.fullName || "")}
        </div>
        <h1 className="text-lg font-black leading-tight mb-1">{personal.fullName || "Your Full Name"}</h1>
        <p className="text-[11px] font-bold text-white/80 mb-5">{personal.jobTitle || "Your Professional Title"}</p>

        <div className="space-y-1.5 text-[9px] font-semibold text-white/85 mb-6 pb-6 border-b border-white/20">
          {personal.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" />{personal.email}</div>}
          {personal.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{personal.phone}</div>}
          {personal.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" />{personal.location}</div>}
          {personal.website && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 shrink-0" />{personal.website.replace(/^https?:\/\//, "")}</div>}
        </div>

        {skillsSection?.type === "TAGS" && skillsSection.items.some((t) => t) && (
          <div className="mb-6 pb-6 border-b border-white/20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 text-white/90">{skillsSection.title}</h2>
            <div className="space-y-1.5">
              {skillsSection.items.filter((t) => t).map((tag, idx) => (
                <p key={idx} className="text-[9px] font-semibold text-white/85">{tag}</p>
              ))}
            </div>
          </div>
        )}

        {languagesSection?.type === "LANGUAGES" && languagesSection.items.length > 0 && (
          <div className="mb-6 pb-6 border-b border-white/20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 text-white/90">{languagesSection.title || "Languages"}</h2>
            <div className="space-y-1.5">
              {languagesSection.items.map((lang) => (
                <p key={lang.id} className="text-[9px] font-semibold text-white/85">{lang.language} <span className="text-white/60">· {lang.level}</span></p>
              ))}
            </div>
          </div>
        )}

        {personalDetails.length > 0 && (
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 text-white/90">Details</h2>
            <div className="space-y-1.5">
              {personalDetails.map((d) => (
                <p key={d.label} className="text-[9px] font-semibold text-white/85">
                  <span className="text-white/60">{d.label}: </span>{d.value}
                </p>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="p-[15mm] pl-8">{mainSections.map(renderMainSection)}</div>
    </div>
  );
}
