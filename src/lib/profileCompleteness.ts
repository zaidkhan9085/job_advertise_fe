// Only the fields the calc actually needs, with the two location fields
// loosened to `unknown | null` -- the calc only ever checks their
// truthiness, never their shape, so both a fetched MyCandidateProfile's
// JobLocationRef and my-profile/page.tsx's own CityAutocomplete LocationValue
// (a different shape) satisfy this without either side needing a cast.
export interface ProfileCompletenessInput {
  name: string;
  position: string;
  whatsapp: string;
  email: string;
  industry: string | null;
  nationality: string | null;
  passportNo: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  jobLocation: unknown | null;
  preferredLocation: unknown | null;
  experienceYears: number | null;
  isFresher: boolean;
  summary: string | null;
  skills: string[] | null;
  experience: unknown[] | null;
  education: unknown[] | null;
  certifications: string[] | null;
  projects: unknown[] | null;
}

// Extracted from my-profile/page.tsx's original inline calc so the Overview
// dashboard can show the same completeness % without duplicating the logic.
// "count what's filled" -- each simple field is either present or not,
// each professional section is either present or not.
export function computeProfileCompleteness(profile: ProfileCompletenessInput | null): {
  completeness: number;
  missingSections: string[];
} {
  if (!profile) {
    return { completeness: 0, missingSections: [] };
  }

  const fields = [
    profile.name,
    profile.position,
    profile.whatsapp,
    profile.email,
    profile.industry,
    profile.nationality,
    profile.passportNo,
    profile.dateOfBirth,
    profile.gender,
  ];
  // isFresher is as much a real answer as a number -- "I have no
  // experience yet" isn't an unfilled field.
  const experienceAnswered = profile.isFresher || profile.experienceYears != null;
  const sectionChecks = [
    { label: "Professional Summary", filled: (profile.summary ?? "").trim().length > 0 },
    { label: "Skills", filled: (profile.skills ?? []).length > 0 },
    { label: "Experience", filled: (profile.experience ?? []).length > 0 },
    { label: "Education", filled: (profile.education ?? []).length > 0 },
    { label: "Certifications", filled: (profile.certifications ?? []).length > 0 },
    { label: "Projects", filled: (profile.projects ?? []).length > 0 },
  ];
  const sectionsFilled = sectionChecks.filter((s) => s.filled).length;
  const filled =
    fields.filter((f) => (f ?? "").trim().length > 0).length +
    (profile.jobLocation ? 1 : 0) +
    (profile.preferredLocation ? 1 : 0) +
    (experienceAnswered ? 1 : 0) +
    sectionsFilled;

  return {
    completeness: Math.round((filled / (fields.length + 3 + sectionChecks.length)) * 100),
    missingSections: sectionChecks.filter((s) => !s.filled).map((s) => s.label),
  };
}
