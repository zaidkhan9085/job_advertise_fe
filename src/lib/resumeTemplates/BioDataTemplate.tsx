import type { TemplateContentProps } from "./types";
import { formatDisplayDate } from "./formatDate";

// Formal Indian "Application for the Post of X" bio-data letter format --
// distinct structure from the other three (a cover-letter-style opening and
// a bordered details table), not just a reskin. Same Gulf/Other experience
// split technique as GulfCvTemplate, since this format traditionally lists
// overseas experience prominently for Gulf-bound job applications.
//
// Color customization is deliberately partial here, not absent: body text
// and table borders stay black (a formal application letter reads oddly in
// full color), but the section-heading underlines follow theme.color so
// candidates still get a personalization option, consistent with every
// other template.
const GULF_KEYWORDS = [
  "uae", "u.a.e", "dubai", "abu dhabi", "sharjah", "ajman",
  "saudi", "ksa", "riyadh", "jeddah", "dammam",
  "qatar", "doha", "oman", "muscat", "bahrain", "manama", "kuwait", "gcc", "gulf",
];

export default function BioDataTemplate({ sections, theme }: TemplateContentProps) {
  const personalSection = sections.find((s) => s.type === "PERSONAL");
  const experienceSection = sections.find((s) => s.type === "LIST" && s.id === "experience");
  const educationSection = sections.find((s) => s.type === "LIST" && s.id === "education");
  const skillsSection = sections.find((s) => s.type === "TAGS" && s.id === "skills");

  if (!personalSection || personalSection.type !== "PERSONAL") return null;
  const personal = personalSection.data;

  const expItems = experienceSection?.type === "LIST" ? experienceSection.items.filter((i) => i.title || i.subtitle) : [];
  const eduItems = educationSection?.type === "LIST" ? educationSection.items.filter((i) => i.title || i.subtitle) : [];
  const skills = skillsSection?.type === "TAGS" ? skillsSection.items.filter((t) => t) : [];
  const headingClass = "text-[11px] font-black uppercase tracking-wide border-b-2 pb-1 mb-3";
  const headingStyle = { borderColor: theme.color };

  const detailRows = [
    { label: "Name", value: personal.fullName },
    { label: "Position Applied For", value: personal.jobTitle },
    { label: "Date of Birth", value: formatDisplayDate(personal.dateOfBirth) },
    { label: "Nationality", value: personal.nationality },
    { label: "Gender", value: personal.gender },
    { label: "Passport No.", value: personal.passportNo },
    { label: "Address", value: personal.location },
    { label: "Mobile", value: personal.phone },
    { label: "Email", value: personal.email },
  ].filter((r) => r.value);

  return (
    <div className="text-[10px] leading-relaxed">
      <div className="text-center mb-6">
        <h1 className="text-sm font-black uppercase tracking-wide underline underline-offset-4">Curriculum Vitae</h1>
      </div>

      <p className="mb-4">Respected Sir,</p>
      <p className="mb-6">
        Being given to understand that there is a vacancy in your esteemed organisation for the above-mentioned post,
        I would like to apply for the same. I give below my particulars for your kind perusal and consideration.
      </p>

      <h2 className={headingClass} style={headingStyle}>
        Application for the Post of {personal.jobTitle ? `"${personal.jobTitle}"` : "____________"}
      </h2>

      <table className="w-full mb-6">
        <tbody>
          {detailRows.map((row) => (
            <tr key={row.label}>
              <td className="py-0.5 pr-3 font-bold align-top whitespace-nowrap w-[140px]">{row.label}</td>
              <td className="py-0.5 align-top">: {row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {eduItems.length > 0 && (
        <>
          <h2 className={headingClass} style={headingStyle}>Educational Qualification</h2>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            {eduItems.map((e) => (
              <li key={e.id}>
                <span className="font-bold">{e.title}</span>
                {e.subtitle ? ` — ${e.subtitle}` : ""}
                {e.date ? ` (${e.date})` : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      {expItems.length > 0 && (
        <>
          <h2 className={headingClass} style={headingStyle}>Work Experience Details</h2>
          <table className="w-full border border-black mb-6 text-[9px]">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-1.5 w-8">S.No</th>
                <th className="border-r border-black p-1.5 text-left">Name of the Company / Position</th>
                <th className="p-1.5 w-32">Period</th>
              </tr>
            </thead>
            <tbody>
              {expItems.map((item, idx) => {
                const isGulf = GULF_KEYWORDS.some((kw) => `${item.subtitle} ${item.content}`.toLowerCase().includes(kw));
                return (
                  <tr key={item.id} className="border-t border-black align-top">
                    <td className="border-r border-black p-1.5 text-center">{idx + 1}</td>
                    <td className="border-r border-black p-1.5">
                      <p className="font-bold">
                        {item.title} {isGulf && <span className="font-normal text-[8px]">(Gulf Experience)</span>}
                      </p>
                      <p>{item.subtitle}</p>
                      {item.content && <p className="mt-0.5">{item.content}</p>}
                    </td>
                    <td className="p-1.5 text-center">{item.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {skills.length > 0 && (
        <>
          <h2 className={headingClass} style={headingStyle}>Skills</h2>
          <p className="mb-6">{skills.join(", ")}</p>
        </>
      )}

      <div className="flex justify-between mt-10">
        <p>Date: ____________</p>
        <p className="font-bold">{personal.fullName}</p>
      </div>
      <p className="text-right">Place: ____________</p>
    </div>
  );
}
