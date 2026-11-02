// Real types for the Resume Builder's {theme, sections} document, replacing
// the `any`-typed shape the builder used before. Deliberately kept loose
// where templates need to tolerate missing/extra fields (candidates can add
// custom sections) but typed everywhere a template actually reads data.

export interface PersonalData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  // Gulf CV / Europass fields -- optional everywhere, including on
  // CandidateProfile itself (passportNo especially: multiple sources flag
  // putting a passport number on a CV as a privacy risk, never required).
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  passportNo?: string;
}

export interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  content: string;
}

// CEFR scale (A1-C2) -- the one specific, legally-grounded Europass detail
// worth modeling exactly rather than as free text.
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface LanguageItem {
  id: string;
  language: string;
  level: CefrLevel;
}

export type ResumeSection =
  | { id: string; type: "PERSONAL"; title: string; isExpanded: boolean; data: PersonalData }
  | { id: string; type: "SUMMARY"; title: string; isExpanded: boolean; data: { content: string } }
  | { id: string; type: "LIST"; title: string; isExpanded: boolean; lastId: number; items: ListItem[] }
  | { id: string; type: "TAGS"; title: string; isExpanded: boolean; items: string[] }
  | { id: string; type: "LANGUAGES"; title: string; isExpanded: boolean; lastId: number; items: LanguageItem[] };

export interface ResumeTheme {
  color: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  sectionSpacing: number;
}

export interface ResumeData {
  theme: ResumeTheme;
  sections: ResumeSection[];
}

export type TemplateId = "modern" | "ats-safe" | "gulf-cv" | "europass" | "bio-data" | "sidebar" | "minimalist" | "executive" | "timeline";

// Rendered content props every template component receives -- the outer
// A4-page/print-CSS shell lives once in Preview.tsx, not duplicated per
// template.
export interface TemplateContentProps {
  sections: ResumeSection[];
  theme: ResumeTheme;
}

export interface ModernPalette {
  id: string;
  label: string;
  color: string;
}

// Shared accent-color list used by every color-customizable template
// (Modern, Gulf CV, Europass, Bio-Data's heading accents) -- originally
// Modern-only, widened once Gulf CV/Europass/Bio-Data started reading
// theme.color too. "signal-blue" stays first and exactly matches the
// pre-existing default (#1098F0) on purpose -- any resume saved before
// templates existed has `template: null`, falls back to "modern", and must
// render identically to how it always has. Changing this entry's color
// would be a visual regression for every existing saved resume.
export const RESUME_PALETTES: ModernPalette[] = [
  { id: "signal-blue", label: "Signal Blue", color: "#1098F0" },
  { id: "slate", label: "Slate", color: "#334155" },
  { id: "emerald", label: "Emerald", color: "#059669" },
  { id: "rose", label: "Rose", color: "#E11D48" },
  { id: "amber", label: "Amber", color: "#D97706" },
  { id: "violet", label: "Violet", color: "#7C3AED" },
  { id: "teal", label: "Teal", color: "#0D9488" },
  { id: "indigo", label: "Indigo", color: "#4F46E5" },
  { id: "charcoal", label: "Charcoal", color: "#1E293B" },
  { id: "burgundy", label: "Burgundy", color: "#9F1239" },
  // The real Europass official color -- included as a normal palette entry
  // (not hardcoded in EuropassTemplate) so a candidate can still pick the
  // authentic look, or any other color, the same way as every template.
  { id: "europass-blue", label: "Europass Blue", color: "#003399" },
];

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
  // Only the plain, no-color, no-icon template is labeled ATS-Safe --
  // matching how Kickresume/Enhancv flag a specific safe subset rather than
  // calling everything "ATS-friendly" (a label industry research found is
  // often just marketing). Modern/Gulf CV/Europass are still single-column
  // and text-based (no tables, no multi-column), just not zero-risk.
  atsSafe: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "ats-safe", label: "ATS-Safe", description: "Plain black-and-white, built to parse cleanly in applicant tracking systems.", atsSafe: true },
  { id: "modern", label: "Modern", description: "Clean single-column layout with a color accent you pick.", atsSafe: false },
  { id: "gulf-cv", label: "Gulf CV", description: "Adds nationality, date of birth, and a Gulf vs. other-experience split for Middle East applications.", atsSafe: false },
  { id: "europass", label: "Europass", description: "EU-standard layout with CEFR-rated language skills (A1-C2).", atsSafe: false },
  { id: "bio-data", label: "Bio-Data", description: "Formal Indian application letter format with a bordered work-experience table.", atsSafe: false },
  { id: "sidebar", label: "Sidebar", description: "Two-column layout with a colored sidebar for contact, skills, and languages.", atsSafe: false },
  { id: "minimalist", label: "Minimalist", description: "Restrained and editorial -- light type, thin rules, no icons or color blocks.", atsSafe: false },
  { id: "executive", label: "Executive", description: "Traditional serif format for senior roles, centered header with a double rule.", atsSafe: false },
  { id: "timeline", label: "Timeline", description: "Like Modern, but experience and education are plotted on a vertical timeline.", atsSafe: false },
];
