import type { ResumeSection } from "./types";

// Shared fake-candidate data for the template picker's thumbnails -- real,
// live TemplateRenderer instances scaled down via CSS, not static images
// (adopting the sister site's technique: thumbnails rendered this way can
// never drift out of sync with what a template actually looks like, since
// it IS the template).
export const SAMPLE_SECTIONS: ResumeSection[] = [
  {
    id: "personal",
    type: "PERSONAL",
    title: "Personal Details",
    isExpanded: true,
    data: {
      fullName: "Amara Osei",
      jobTitle: "Senior Operations Manager",
      email: "amara.osei@example.com",
      phone: "+971 50 123 4567",
      location: "Dubai, UAE",
      website: "",
      dateOfBirth: "14 Mar 1991",
      nationality: "Ghanaian",
      gender: "Female",
      passportNo: "G1234567",
    },
  },
  {
    id: "summary",
    type: "SUMMARY",
    title: "Professional Summary",
    isExpanded: true,
    data: { content: "Operations leader with 8+ years driving efficiency across logistics and retail teams in the GCC and West Africa." },
  },
  {
    id: "experience",
    type: "LIST",
    title: "Work Experience",
    isExpanded: true,
    lastId: 2,
    items: [
      { id: "1", title: "Operations Manager", subtitle: "Al Futtaim Group, Dubai, UAE", date: "2021 — Present", content: "Led a 40-person team across 3 distribution centers, cutting fulfillment time by 22%." },
      { id: "2", title: "Operations Supervisor", subtitle: "Melcom Group, Accra, Ghana", date: "2017 — 2021", content: "Managed inventory and staffing for 6 retail locations." },
    ],
  },
  {
    id: "education",
    type: "LIST",
    title: "Education",
    isExpanded: true,
    lastId: 1,
    items: [{ id: "1", title: "B.Sc. Business Administration", subtitle: "University of Ghana", date: "2013 — 2017", content: "" }],
  },
  {
    id: "skills",
    type: "TAGS",
    title: "Core Skills",
    isExpanded: true,
    items: ["Supply Chain", "Team Leadership", "Inventory Systems", "Budgeting"],
  },
  {
    id: "languages",
    type: "LANGUAGES",
    title: "Language Skills",
    isExpanded: true,
    lastId: 2,
    items: [
      { id: "1", language: "English", level: "C2" },
      { id: "2", language: "French", level: "B1" },
    ],
  },
];
