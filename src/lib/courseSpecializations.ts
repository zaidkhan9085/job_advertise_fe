// Fixed Course -> Specialization taxonomy for the Education section, styled
// after Naukri/Shine's standard Indian-education dropdown structure, plus
// the Diploma/ITI trade courses relevant to this platform's blue-collar Gulf
// candidates. Mirrors backend/utils/courseSpecializations.js exactly -- keep
// both in sync by hand if this list ever changes.
//
// Every list (including COURSE_OPTIONS itself) ends with "Other" so nothing
// is a dead end. "Other" the course has no specialization list at all --
// callers should hide/disable the Specialization control in that case.

export const COURSE_OPTIONS = [
  "10th",
  "12th",
  "Diploma",
  "ITI",
  "B.A",
  "B.Com",
  "B.Sc",
  "B.Tech/B.E.",
  "BBA/BMS",
  "BCA",
  "B.Pharma",
  "B.Arch",
  "LLB",
  "MBBS",
  "BDS",
  "B.Ed",
  "B.Voc",
  "BHM",
  "M.A",
  "M.Com",
  "M.Sc",
  "M.Tech/M.E.",
  "MBA/PGDM",
  "MCA",
  "M.Pharma",
  "LLM",
  "MD/MS",
  "M.Arch",
  "M.Ed",
  "PhD/Doctorate",
  "Other",
];

const ENGINEERING_SPECIALIZATIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Automobile",
  "Aeronautical",
  "Industrial",
  "Mining",
  "Petroleum",
  "Instrumentation",
  "Biotechnology",
  "Other",
];

const MBA_SPECIALIZATIONS = [
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "IT/Systems",
  "International Business",
  "Supply Chain & Logistics",
  "Business Analytics",
  "Healthcare Management",
  "Other",
];

const SCIENCE_SPECIALIZATIONS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Computer Science",
  "Biology/Life Sciences",
  "Biotechnology",
  "Statistics",
  "Electronics",
  "Agriculture",
  "Environmental Science",
  "Other",
];

const ARTS_SPECIALIZATIONS = [
  "Economics",
  "History",
  "Political Science",
  "Psychology",
  "English Literature",
  "Sociology",
  "Geography",
  "Public Administration",
  "Journalism & Mass Communication",
  "Other",
];

const COMMERCE_SPECIALIZATIONS = [
  "Accounting & Finance",
  "Banking & Insurance",
  "Taxation",
  "Business Economics",
  "Computer Applications",
  "Other",
];

const LAW_SPECIALIZATIONS = [
  "Corporate Law",
  "Criminal Law",
  "Civil Law",
  "Constitutional Law",
  "Intellectual Property Law",
  "Tax Law",
  "Labour Law",
  "Other",
];

const MEDICINE_SPECIALIZATIONS = [
  "General Medicine",
  "Surgery",
  "Pediatrics",
  "Gynaecology",
  "Orthopedics",
  "Cardiology",
  "Dermatology",
  "Other",
];

const EDUCATION_DEGREE_SPECIALIZATIONS = ["Elementary Education", "Secondary Education", "Special Education", "Physical Education", "Other"];

const PHARMACY_SPECIALIZATIONS = ["Pharmaceutics", "Pharmacology", "Pharmaceutical Chemistry", "Pharmacy Practice", "Other"];

const ARCHITECTURE_SPECIALIZATIONS = ["Architecture", "Urban Planning", "Interior Architecture", "Landscape Architecture", "Other"];

const COMPUTER_APPLICATIONS_SPECIALIZATIONS = ["Computer Applications", "Software Development", "Data Science", "Networking", "Other"];

const SCHOOL_STREAM_SPECIALIZATIONS = ["Science", "Commerce", "Arts", "Other"];

export const SPECIALIZATIONS_BY_COURSE: Record<string, string[]> = {
  "10th": SCHOOL_STREAM_SPECIALIZATIONS,
  "12th": SCHOOL_STREAM_SPECIALIZATIONS,
  Diploma: [
    "Mechanical",
    "Electrical",
    "Civil",
    "Electronics",
    "Computer",
    "Automobile",
    "Chemical",
    "Hotel Management",
    "Fashion Design",
    "Interior Design",
    "Other",
  ],
  ITI: ["Electrician", "Fitter", "Welder", "Plumber", "Motor Vehicle Mechanic", "Machinist", "Carpenter", "Draughtsman", "Turner", "Wireman", "Other"],
  "B.A": ARTS_SPECIALIZATIONS,
  "M.A": ARTS_SPECIALIZATIONS,
  "B.Com": COMMERCE_SPECIALIZATIONS,
  "M.Com": COMMERCE_SPECIALIZATIONS,
  "B.Sc": SCIENCE_SPECIALIZATIONS,
  "M.Sc": SCIENCE_SPECIALIZATIONS,
  "B.Tech/B.E.": ENGINEERING_SPECIALIZATIONS,
  "M.Tech/M.E.": ENGINEERING_SPECIALIZATIONS,
  "BBA/BMS": ["Marketing", "Finance", "Human Resources", "International Business", "Entrepreneurship", "Other"],
  BCA: COMPUTER_APPLICATIONS_SPECIALIZATIONS,
  MCA: COMPUTER_APPLICATIONS_SPECIALIZATIONS,
  "B.Pharma": PHARMACY_SPECIALIZATIONS,
  "M.Pharma": PHARMACY_SPECIALIZATIONS,
  "B.Arch": ARCHITECTURE_SPECIALIZATIONS,
  "M.Arch": ARCHITECTURE_SPECIALIZATIONS,
  LLB: LAW_SPECIALIZATIONS,
  LLM: LAW_SPECIALIZATIONS,
  MBBS: MEDICINE_SPECIALIZATIONS,
  "MD/MS": MEDICINE_SPECIALIZATIONS,
  BDS: ["Dental Surgery", "Orthodontics", "Periodontics", "Other"],
  "B.Ed": EDUCATION_DEGREE_SPECIALIZATIONS,
  "M.Ed": EDUCATION_DEGREE_SPECIALIZATIONS,
  "B.Voc": ["Retail Management", "IT & Software", "Healthcare", "Hospitality", "Banking & Finance", "Other"],
  BHM: ["Hotel Management", "Culinary Arts", "Hospitality Operations", "Other"],
  "MBA/PGDM": MBA_SPECIALIZATIONS,
  "PhD/Doctorate": ["Other"],
  // "Other" intentionally has no entry -- callers must hide/disable the
  // Specialization control when course === "Other".
};

export function getSpecializationOptions(course: string | undefined | null): string[] {
  if (!course || course === "Other") return [];
  return SPECIALIZATIONS_BY_COURSE[course] ?? [];
}
