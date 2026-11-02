import type { MyCandidateProfile, ProfileEntry } from "@/lib/api";
import type { ResumeSection, ListItem } from "@/lib/resumeTemplates/types";

// experience/education/projects already share the exact {id, title,
// subtitle, date, content} shape the builder's LIST items use (confirmed:
// backend/controllers/candidateController.js's sanitizeEntryList writes
// this same shape) -- direct assignment, no per-field transform. Only
// `course`/`specialization` (education-only, not part of ListItem) get
// dropped, which is harmless since nothing reads them here.
function toListItems(entries: ProfileEntry[] | null): ListItem[] {
  if (!entries || entries.length === 0) return [];
  return entries.map((e) => ({ id: e.id, title: e.title, subtitle: e.subtitle, date: e.date, content: e.content }));
}

// Prefers the structured jobLocation relation (City, State, Country) over
// the deprecated free-text currentLocation -- same preference order the
// rest of the app already gives jobLocation elsewhere.
function stringifyLocation(profile: MyCandidateProfile): string {
  if (profile.jobLocation) {
    return [profile.jobLocation.name, profile.jobLocation.stateName, profile.jobLocation.countryName]
      .filter(Boolean)
      .join(", ");
  }
  return profile.currentLocation || "";
}

// Builds a full {theme, sections} document from the candidate's existing
// CandidateProfile -- used both for the automatic first-visit pre-fill and
// the manual "Import from My Profile" button. Pure function: given the same
// profile, always produces the same sections array, nothing mutated.
export function mapProfileToResumeSections(profile: MyCandidateProfile): ResumeSection[] {
  const sections: ResumeSection[] = [
    {
      id: "personal",
      type: "PERSONAL",
      title: "Personal Details",
      isExpanded: true,
      data: {
        fullName: profile.name || "",
        jobTitle: profile.position || "",
        email: profile.email || "",
        phone: profile.whatsapp || "",
        location: stringifyLocation(profile),
        website: "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : undefined,
        nationality: profile.nationality || undefined,
        gender: profile.gender || undefined,
        passportNo: profile.passportNo || undefined,
      },
    },
    {
      id: "summary",
      type: "SUMMARY",
      title: "Professional Summary",
      isExpanded: true,
      data: { content: profile.summary || "" },
    },
  ];

  const experienceItems = toListItems(profile.experience);
  sections.push({
    id: "experience",
    type: "LIST",
    title: "Work Experience",
    isExpanded: true,
    lastId: Math.max(experienceItems.length, 1),
    items: experienceItems.length > 0 ? experienceItems : [{ id: "1", title: "", subtitle: "", date: "", content: "" }],
  });

  const educationItems = toListItems(profile.education);
  sections.push({
    id: "education",
    type: "LIST",
    title: "Education",
    isExpanded: true,
    lastId: Math.max(educationItems.length, 1),
    items: educationItems.length > 0 ? educationItems : [{ id: "1", title: "", subtitle: "", date: "", content: "" }],
  });

  sections.push({
    id: "skills",
    type: "TAGS",
    title: "Core Skills",
    isExpanded: true,
    items: profile.skills && profile.skills.length > 0 ? profile.skills : [""],
  });

  if (profile.certifications && profile.certifications.length > 0) {
    sections.push({
      id: "certifications",
      type: "TAGS",
      title: "Certifications",
      isExpanded: true,
      items: profile.certifications,
    });
  }

  if (profile.projects && profile.projects.length > 0) {
    const projectItems = toListItems(profile.projects);
    sections.push({
      id: "projects",
      type: "LIST",
      title: "Projects",
      isExpanded: true,
      lastId: projectItems.length,
      items: projectItems,
    });
  }

  return sections;
}
